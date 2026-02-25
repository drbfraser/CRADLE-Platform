import { getTemplate } from 'src/shared/api';
import { Nullable } from 'src/shared/constants';
import { Patient } from 'src/shared/types/patientTypes';
import {
  WorkflowInstance,
  WorkflowInstanceStep,
  WorkflowInstanceStepEvaluation,
  WorkflowTemplate,
  WorkflowTemplateStep,
} from 'src/shared/types/workflow/workflowApiTypes';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceDetails,
  InstanceStep,
  PossibleStep,
  WorkflowInfoRow,
  WorkflowNextStepOption,
} from 'src/shared/types/workflow/workflowUiTypes';
import {
  formatISODateNumber,
  formatISODateNumberWithTime,
  getDateFromStringTimestamp,
} from 'src/shared/utils';

export const formatWorkflowStepStatusText = (s: InstanceStep) => {
  if (s.status === StepStatus.COMPLETED && s.completedOn) {
    return `Status: Completed, Completed on: ${getDateFromStringTimestamp(
      s.completedOn
    )}`;
  }
  if (s.status === StepStatus.ACTIVE) {
    return `Status: In Progress${
      s.startedOn
        ? `, Started on: ${getDateFromStringTimestamp(s.startedOn)}`
        : ''
    }`;
  }
  return 'Status: Possible future step';
};

export function parseYMD(d?: Nullable<string>) {
  if (!d) return undefined;
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, day ?? 1);
  return isNaN(dt.getTime()) ? undefined : dt;
}

export function daysBetween(a: Date, b: Date) {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Computes:
 *  - completed / total
 *  - percent (0-100)
 *  - estDaysRemaining, etaDate (when not completed)
 *
 * Estimation logic:
 *   If we can infer at least one completed step duration (startedOn → completedOn),
 *   we use the average of those durations. Otherwise we fall back to 7 days per step.
 */
export function computeProgressAndEta(steps: InstanceStep[], now = new Date()) {
  const total = steps.length || 1;
  const completed = steps.filter(
    (s) => s.status === StepStatus.COMPLETED
  ).length;
  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.status === StepStatus.ACTIVE)
  );
  const percent = Math.round((completed / total) * 100);

  // Estimate days per step
  const durations: number[] = [];
  for (const s of steps) {
    const start = parseYMD(s.startedOn);
    const end = parseYMD(s.completedOn);
    if (start && end) durations.push(daysBetween(start, end));
  }
  const defaultDaysPerStep = 7;
  const avgDaysPerStep = durations.length
    ? Math.max(
        1,
        Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      )
    : defaultDaysPerStep;

  const remaining = total - completed;
  const estDaysRemaining = remaining > 0 ? remaining * avgDaysPerStep : 0;
  const etaDate =
    remaining > 0
      ? new Date(now.getTime() + estDaysRemaining * 86400000)
      : undefined;

  return { total, completed, percent, estDaysRemaining, etaDate, currentIndex };
}

export function findTemplateStepById(
  templateStepId: string,
  template: WorkflowTemplate
) {
  return template.steps?.find((step) => step.id === templateStepId);
}

export function mapWorkflowStep(
  apiStep: WorkflowInstanceStep,
  template: WorkflowTemplate
): InstanceStep {
  const templateStep: WorkflowTemplateStep | undefined = findTemplateStepById(
    apiStep.workflowTemplateStepId,
    template
  );

  if (!templateStep) {
    throw new Error(
      `No template step found for id ${apiStep.workflowTemplateStepId}`
    );
  }

  const workflowInstanceStep: InstanceStep = {
    id: apiStep.id,
    title: apiStep.name,
    status: apiStep.status,
    startedOn: formatISODateNumberWithTime(apiStep.startDate),
    completedOn: apiStep.completionDate
      ? formatISODateNumberWithTime(apiStep.completionDate)
      : null,
    description: apiStep.description,
    expectedCompletion: apiStep.expectedCompletion
      ? formatISODateNumber(apiStep.expectedCompletion)
      : null,
    // nextStep?: string;  // TODO: Not implemented in backend yet
    formSubmitted: apiStep.formId ? true : false,
    workflowTemplateStepId: apiStep.workflowTemplateStepId,
  };

  if (templateStep.formId)
    workflowInstanceStep.formTemplateId = templateStep.formId;

  if (apiStep.formId) workflowInstanceStep.formId = apiStep.formId;
  if (apiStep.form) workflowInstanceStep.form = apiStep.form;

  return workflowInstanceStep;
}

export function buildInstanceDetails(
  instance: WorkflowInstance,
  template: WorkflowTemplate,
  patient: Patient
): InstanceDetails {
  const instanceDetails: InstanceDetails = {
    id: instance.id,
    studyTitle: instance.name,
    patientName: patient.name,
    patientId: instance.patientId,
    description: instance.description,
    collection: 'PAPAGO', // TODO - To do when collections set up
    version: template.version,
    firstCreatedOn: formatISODateNumber(template.dateCreated),
    lastEditedOn: formatISODateNumber(instance.lastEdited),
    lastEditedBy: instance.lastEditedBy,
    workflowStartedOn: formatISODateNumber(instance.startDate),
    workflowStartedBy: 'N/A', // TODO - add to backend? currently not in DB
    workflowCompletedOn: instance.completionDate
      ? formatISODateNumber(instance.completionDate)
      : null,

    // Steps
    steps: instance.steps.map((step) => mapWorkflowStep(step, template)),
    possibleSteps: initiateWorkflowPossibleSteps(
      instance.steps.map((step) => mapWorkflowStep(step, template)),
      template
    ),
  };

  return instanceDetails;
}

/**
 * Returns the workflow step history for a given instance,
 * with the active step first and completed steps in reverse chronological order.
 *
 * @param instance InstanceDetails object
 * @returns InstanceStep array with active step first and completed steps in reverse chronology
 */
export function getWorkflowStepHistory(
  instance: InstanceDetails
): InstanceStep[] {
  return [
    ...instance.steps.filter((s) => s.status === StepStatus.ACTIVE), // get active step(s)
    ...instance.steps // append completed steps in reverse chronological order
      .filter(
        (step): step is InstanceStep & { completedOn: string } =>
          step.completedOn !== null
      )
      .sort(
        (a, b) => b.completedOn.localeCompare(a.completedOn) // using string comparison since dates are string ISO format (and comparing Date objects to string wasn't working)
      ),
  ];
}

/**
 * Converts the {@link PossibleStep} tree in the workflow instance details into a
 * flattened array of possible future steps for UI rendering.
 * If the workflow instance is complete, returns an empty array.
 *
 * @param instance InstanceDetails object
 * @returns a flattened array of the possible steps tree in UI render order
 */
export function getWorkflowPossibleSteps(
  instance: InstanceDetails
): PossibleStep[] {
  const currentStepId = getWorkflowCurrentStep(instance)?.id ?? null;
  if (!currentStepId) return []; // TODO: better handling of no active step case
  const [main, trimmed] = getWorkflowPossibleStepsArray(
    instance.possibleSteps,
    currentStepId
  );
  return [...main, ...trimmed];
}

/**
 * Helper function used in {@link getWorkflowPossibleSteps}.
 * Flattens the {@link PossibleStep} tree into an array, with the "main" branch
 * (the branch containing all the descendants of the current active step) first,
 * followed by the "trimmed" branches (other possible future steps not on the main path).
 *
 * @param baseStep PossibleStep of the root node in the workflow tree
 * @param currentStepID id of the currently active step
 * @param pastCurrent boolean indicator of whether we are past the current step in the workflow tree (default false)
 * @returns tuple of main and trimmed possible steps arrays
 */
function getWorkflowPossibleStepsArray(
  baseStep: PossibleStep,
  currentStepID: string,
  pastCurrent: boolean = false
): [PossibleStep[], PossibleStep[]] {
  const main: PossibleStep[] = [];
  const trimmed: PossibleStep[] = [];
  const isCurrent = pastCurrent || baseStep.id === currentStepID;

  if (baseStep.status === StepStatus.PENDING) {
    if (isCurrent) {
      main.push(baseStep);
    } else {
      trimmed.push(baseStep);
    }
  }
  for (const branch of baseStep.branches) {
    const [branchMain, branchTrimmed] = getWorkflowPossibleStepsArray(
      branch,
      currentStepID,
      isCurrent
    );
    main.push(...branchMain);
    trimmed.push(...branchTrimmed);
  }
  return [main, trimmed];
}

/**
 * Returns the number of possible future steps available based on the workflow instance details.
 * Possible future steps do not include steps that are already completed or active.
 *
 * @param instance InstanceDetails object
 * @returns number specifying the amount of possible steps available
 */
export function getWorkflowPossibleStepsLength(
  instance: InstanceDetails
): number {
  return (
    instance.steps.filter((s) => s.status === StepStatus.PENDING).length ?? 0
  );
}

/**
 * Maps an {@link InstanceStep} to a {@link PossibleStep}.
 *
 * @param step InstanceStep to map
 * @returns PossibleStep
 */
function mapWorkflowPossibleStep(step: InstanceStep): PossibleStep {
  const possibleStep: PossibleStep = {
    id: step.id,
    title: step.title,
    indent: 0,
    branches: [],
    status: step.status,
    shortestPathLength: Infinity, // to be computed in initiateWorkflowPossibleSteps
    hasForm: step.formTemplateId ? true : false,
  };
  return possibleStep;
}

/**
 * Computes a {@link PossibleStep} tree from the workflow template and instance steps.
 *
 * @param instance InstanceStep array
 * @param template WorkflowTemplate object
 * @returns PossibleStep object of the root node in the workflow tree
 */
export function initiateWorkflowPossibleSteps(
  instance: InstanceStep[],
  template: WorkflowTemplate
): PossibleStep {
  const templateStepMap = Object.fromEntries(
    template.steps.map((s) => [s.id, s])
  );
  const instanceStepMap = Object.fromEntries(
    instance.map((s) => [s.workflowTemplateStepId, mapWorkflowPossibleStep(s)])
  );

  return getWorkflowTree(
    // get starting node
    template.startingStepId
      ? template.startingStepId
      : instance[0].workflowTemplateStepId, // TODO: better handling of no starting step case
    templateStepMap,
    instanceStepMap,
    new Set<string>(),
    0
  );
}

/**
 * A helper function used in {@link initiateWorkflowPossibleSteps}
 * that recursively builds the {@link PossibleStep} tree.
 * - Uses DFS to traverse the workflow template steps starting from the root stepID.
 * - Calculates the shortest path length from each node to the end of the workflow (for progress estimation).
 * - Calculates indent level for each node (for formatting in UI).
 *
 * @param stepId string template id of the initial step
 * @param templateStepMap Record<string, WorkflowTemplateStep>
 * @param instanceStepMap Record<string, PossibleStep>
 * @param visited Set<string> of visited step ids to prevent cycles
 * @param indent number representing the current indent level for formatting
 * @returns PossibleStep root node (where stepID is the root node)
 */
function getWorkflowTree(
  stepId: string,
  templateStepMap: Record<string, WorkflowTemplateStep>,
  instanceStepMap: Record<string, PossibleStep>,
  visited: Set<string>,
  indent: number
): PossibleStep {
  const step = templateStepMap[stepId];
  if (!step) {
    throw new Error(`No template step found for step id ${stepId}`);
  } // TODO: better handling of no step found case

  // Possibly a cycle or a repeated step
  if (visited.has(stepId)) {
    return {
      ...instanceStepMap[stepId],
      indent,
      shortestPathLength: Infinity, // TODO: better handling of cycles (infinity is a placeholder)
    };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(stepId);

  const baseNode: PossibleStep = {
    ...instanceStepMap[stepId],
    indent,
    shortestPathLength: 1,
  };

  // Leaf node (possible step)
  if (!step.branches || step.branches.length === 0) {
    return baseNode;
  }

  let shortestPath = Infinity;

  for (const branch of step.branches) {
    const childIndent = indent + (step.branches.length > 1 ? 1 : 0); // increase indent for diverging branches

    const subTree = getWorkflowTree(
      branch.targetStepId,
      templateStepMap,
      instanceStepMap,
      nextVisited,
      childIndent
    );

    baseNode.branches.push(subTree);

    shortestPath = Math.min(shortestPath, subTree.shortestPathLength);
  }

  baseNode.shortestPathLength =
    shortestPath === Infinity ? Infinity : shortestPath + 1;

  return baseNode;
}

/**
 * Finds the current active step in the workflow instance, or returns undefined if no step is active.
 *
 * @param instance {@link InstanceDetails} object
 * @returns the current step in the workflow instance, or undefined if no step is active
 */
export function getWorkflowCurrentStep(instance: InstanceDetails) {
  const steps = instance.steps;
  const currentStep = steps.find((step) => step.status === StepStatus.ACTIVE);
  return currentStep;
}

/**
 * Recursively searches the PossibleStep tree to find the current step and
 * returns the shortest path length from the current step to the end of the workflow.
 *
 * @param instance {@link InstanceDetails} object
 * @returns number representing the shortest path length from the current step to the end of the workflow
 */
export function getWorkflowShortestPath(instance: InstanceDetails): number {
  const currentStep = getWorkflowCurrentStep(instance);
  if (!currentStep) return Infinity; // TODO: better handling of no active step case

  const root = instance.possibleSteps;
  const queue: PossibleStep[] = [root];
  const visited = new Set<PossibleStep>([root]);

  while (queue.length > 0) {
    const step = queue.shift()!; // TODO: better handling of empty queue case
    if (step.id === currentStep.id) {
      return step.shortestPathLength;
    }

    for (const branch of step.branches) {
      if (branch.id === currentStep.id) {
        return branch.shortestPathLength;
      }
      if (!visited.has(branch)) {
        visited.add(branch);
        queue.push(branch);
      }
    }
  }

  return Infinity;
}

export function getWorkflowStepWithId(
  stepId: string,
  instanceDetails: InstanceDetails
): InstanceStep | null {
  const step = instanceDetails.steps.find((step) => step.id === stepId);
  return step ?? null;
}

export const buildWorkflowInstanceRowList = async (
  instances: WorkflowInstance[]
) => {
  const workflowInfoRows = await Promise.all(
    instances.map(async (instance) => {
      const currentStep = instance.steps.find(
        (step) => step.status === StepStatus.ACTIVE
      );
      const template = await getTemplate(instance.workflowTemplateId);
      const workflowInfoRow: WorkflowInfoRow = {
        id: instance.id,
        instanceTitle: instance.name,
        templateId: instance.workflowTemplateId,
        templateName: template.classification?.name || template.name || 'N/A',
        collection: 'PAPAGAO', // TODO - To do when collections set up
        status: instance.status,
        lastEdited: instance.lastEdited,
        stepsCount: instance.steps.length,
        currentStepLabel: currentStep ? currentStep.name : 'N/A',
      };
      return workflowInfoRow;
    })
  );
  return workflowInfoRows;
};

export const getTargetTemplateStepFromBranchId = (
  instance: InstanceDetails,
  template: WorkflowTemplate,
  currentStepId: string,
  branchId: string
): InstanceStep | undefined => {
  const templateStepId = instance.steps.find(
    (step) => step.id === currentStepId
  )?.workflowTemplateStepId;

  if (!templateStepId) return undefined;

  const templateStep = template.steps.find(
    (step) => step.id === templateStepId
  );

  const targetTemplateStepId = templateStep?.branches?.find(
    (branch) => branch.id === branchId
  )?.targetStepId;

  return instance.steps.find(
    (step) => step.workflowTemplateStepId === targetTemplateStepId
  );
};

export const getWorkflowNextStepOptions = (
  instance: InstanceDetails,
  template: WorkflowTemplate,
  stepEval: WorkflowInstanceStepEvaluation,
  currentStepId: string
) => {
  const branchEvals = stepEval.branchEvaluations;
  const selectedBranchId = stepEval.selectedBranchId;
  const nextOptions: WorkflowNextStepOption[] = [];

  branchEvals.forEach((branchEval) => {
    const targetInstanceStep = getTargetTemplateStepFromBranchId(
      instance,
      template,
      currentStepId,
      branchEval.branchId
    );
    if (!targetInstanceStep) {
      return;
    }
    const nextOption: WorkflowNextStepOption = {
      branchId: branchEval.branchId,
      stepId: targetInstanceStep.id,
      title: targetInstanceStep.title,
      isRecommended: selectedBranchId === branchEval.branchId,
      rule: branchEval.rule ?? 'N/A',
      ruleStatus: branchEval.ruleStatus,
      varResolutions: branchEval.varResolutions,
    };

    nextOptions.push(nextOption);
  });

  return nextOptions;
};

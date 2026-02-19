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
  WorkflowPath,
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
    possibleSteps: getWorkflowPossibleSteps(
      instance.steps.map((step) => mapWorkflowStep(step, template)),
      template
    ),
  };

  return instanceDetails;
}

/**
 * Returns steps in the order of:
 *  - Active step(s) first (in case of parallel branches)
 *  - Then completed steps in reverse chronological order (most recent first)
 *  - Possible steps are not returned
 */
export function getWorkflowStepHistory(steps: InstanceStep[]): InstanceStep[] {
  return [
    ...steps.filter((s) => s.status === StepStatus.ACTIVE), // get active step(s)
    ...steps // append completed steps in reverse chronological order
      .filter(
        (step): step is InstanceStep & { completedOn: string } =>
          step.completedOn !== null
      )
      .sort(
        (a, b) => b.completedOn.localeCompare(a.completedOn) // using string comparison since dates are string ISO format
      ),
  ];
}

function mapWorkflowPossibleStep(step: InstanceStep) {
  const possibleStep = {
    id: step.id,
    title: step.title,
    indent: 0,
    hasForm: step.formTemplateId ? true : false,
  };
  return possibleStep;
}

/**
 * Returns possible future steps in DFS order (sorted by shortest path first)
 * - Finds all paths from beginning to end of workflow, then deduplicates steps that appear in multiple paths (e.g. due to completion, cycles, converging/diverging branches, etc.)
 * - Steps that are already completed or active are not included in the possible steps
 * - Cycles are handled by keeping track of visited steps (for handling future cyclical workflow implementation)
 * - TODO: better handling of edge cases caused by overriding steps (e.g. skipping back and forth between branches)
 */
function getWorkflowPossibleSteps(
  instance: InstanceStep[],
  template: WorkflowTemplate
): WorkflowPath[] {
  const currentStep = instance.find((s) => s.status === StepStatus.ACTIVE);
  const templateStepMap = Object.fromEntries(
    template.steps.map((s) => [s.id, s])
  );
  const instanceStepMap = Object.fromEntries(
    instance.map((s) => [s.workflowTemplateStepId, mapWorkflowPossibleStep(s)])
  );

  /**
   * Helper function: DFS to find all paths to end of workflow from current step
   * - includes current step
   * - can probably be further optimized
   */
  function getWorkflowPaths(
    stepId: string,
    currentStepId: string,
    countPath: boolean,
    templateStepMap: Record<string, WorkflowTemplateStep>,
    instanceStepMap: Record<string, PossibleStep>,
    visited: Set<string>
  ): WorkflowPath[] {
    const step = templateStepMap[stepId];
    if (!step) return [];

    const pathCount = countPath || stepId === currentStepId; // start counting path length once we hit the current step

    // Possibly a cycle or a repeated step
    if (visited.has(stepId)) {
      return [
        {
          branch: [],
          length: pathCount ? 1 : 0,
          hasCycle: true,
          trimmed: false,
        },
      ];
    }

    const nextVisited = new Set(visited);
    nextVisited.add(stepId);

    // Leaf node (possible step)
    if (!step.branches || step.branches.length === 0) {
      return [
        {
          branch: [instanceStepMap[stepId]],
          length: pathCount ? 1 : 0,
          hasCycle: false,
          trimmed: false,
        },
      ];
    }

    const paths: WorkflowPath[] = [];
    for (const br of step.branches) {
      instanceStepMap[br.targetStepId].indent =
        instanceStepMap[stepId].indent + (step.branches.length > 1 ? 1 : 0); // increase indent for diverging branches
      const subPaths = getWorkflowPaths(
        br.targetStepId,
        currentStepId,
        pathCount,
        templateStepMap,
        instanceStepMap,
        nextVisited
      );

      for (const sub of subPaths) {
        paths.push({
          branch: [instanceStepMap[stepId], ...sub.branch],
          length: pathCount ? sub.length + 1 : sub.length,
          hasCycle: sub.hasCycle,
          trimmed: false,
        });
      }
    }

    return paths;
  }

  const rawPaths = getWorkflowPaths(
    template.startingStepId
      ? template.startingStepId
      : instance[0].workflowTemplateStepId, // TODO: better handling of no starting step case
    currentStep
      ? currentStep.workflowTemplateStepId
      : instance[0].workflowTemplateStepId, // TODO: better handling of no active step case
    false,
    templateStepMap,
    instanceStepMap,
    new Set<string>()
  ).sort((a, b) => {
    if (a.length === 0 && b.length === 0)
      return a.branch.length - b.branch.length; // sorting trimmed branches
    if (a.length === 0 && b.length !== 0) return 1;
    if (b.length === 0 && a.length !== 0) return -1;
    return a.length - b.length;
  });

  // Deduplicate steps that appear in multiple paths (e.g. due to completion, cycles, converging/diverging branches, etc.)
  const globallySeen = new Set<string>();
  const deduped = rawPaths.map((path) => {
    const newBranch: PossibleStep[] = [];
    for (const step of path.branch) {
      if (
        !globallySeen.has(step.id) &&
        instance.find((s) => s.id == step.id)?.status !== StepStatus.ACTIVE &&
        instance.find((s) => s.id == step.id)?.status !== StepStatus.COMPLETED
      ) {
        globallySeen.add(step.id);
        step.indent -= currentStep
          ? instanceStepMap[currentStep.workflowTemplateStepId].indent
          : 0; // adjust indent based on current step
        newBranch.push(step);
      }
    }
    return { ...path, branch: newBranch };
  });

  // TODO: also handle partially empty paths after deduplication
  if (deduped.every((path) => path.branch.length === 0)) {
    return [];
  }

  return deduped;
}

export function getWorkflowCurrentStep(instance: InstanceDetails) {
  const steps = instance.steps;
  const currentStep = steps.find((step) => step.status === StepStatus.ACTIVE);
  return currentStep;
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
        templateName: template.name,
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

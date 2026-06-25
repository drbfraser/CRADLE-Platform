import {
  WorkflowTemplate,
  WorkflowTemplateStep,
} from 'src/shared/types/workflow/workflowApiTypes';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceDetails,
  InstanceStep,
  PossibleStep,
} from 'src/shared/types/workflow/workflowUiTypes';

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
  // Use the active step if present; fall back to currentStepId as tree anchor (e.g. after reactivation)
  const currentStepId =
    getWorkflowCurrentStep(instance)?.id ?? instance.currentStepId ?? null;
  if (!currentStepId) return [];
  const [main, trimmed] = getWorkflowPossibleStepsArray(
    instance.possibleSteps,
    currentStepId
  );
  const dedupedSteps: PossibleStep[] = [];
  const seenStepIds = new Set<string>();

  for (const step of [...main, ...trimmed]) {
    if (seenStepIds.has(step.id)) {
      continue;
    }
    seenStepIds.add(step.id);
    dedupedSteps.push(step);
  }

  return dedupedSteps;
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
  return getWorkflowPossibleSteps(instance).length;
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
  const instanceStepMap: Record<string, PossibleStep> = Object.fromEntries(
    instance.map((s) => [s.workflowTemplateStepId, mapWorkflowPossibleStep(s)])
  );

  // Steps not yet created on-the-fly get a placeholder so the tree is complete
  for (const templateStep of template.steps) {
    if (!instanceStepMap[templateStep.id]) {
      instanceStepMap[templateStep.id] = {
        id: templateStep.id,
        title: templateStep.name,
        indent: 0,
        branches: [],
        status: StepStatus.PENDING,
        shortestPathLength: Infinity,
        hasForm: !!templateStep.formId,
      };
    }
  }

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
    branches: [],
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
  return instance.steps.find((step) => step.status === StepStatus.ACTIVE);
}

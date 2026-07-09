import { useCallback } from 'react';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';

const DEFAULT_STEP_NAME = 'New Step';
const DEFAULT_STEP_DESCRIPTION = '';

export interface UseWorkflowStepMutationsOptions {
  editedWorkflow: WorkflowTemplate | null;
  setEditedWorkflow: React.Dispatch<
    React.SetStateAction<WorkflowTemplate | null>
  >;
  setHasChanges: (value: boolean) => void;
  setSelectedStepId: (stepId: string) => void;
  clearSelectedStep: () => void;
  selectedStepId: string | undefined;
  captureCurrentState: (workflow: WorkflowTemplate) => void;
  showToast: (message: string) => void;
}

export const useWorkflowStepMutations = ({
  editedWorkflow,
  setEditedWorkflow,
  setHasChanges,
  setSelectedStepId,
  clearSelectedStep,
  selectedStepId,
  captureCurrentState,
  showToast,
}: UseWorkflowStepMutationsOptions) => {
  const handleInsertNode = (stepId: string) => {
    console.log('handleInsertNode called:', stepId);
    if (!editedWorkflow) return;

    const currentStep = editedWorkflow.steps.find((s) => s.id === stepId);
    if (!currentStep) {
      return;
    }

    const newStepId = `step-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newStep = {
      id: newStepId,
      name: DEFAULT_STEP_NAME,
      description: DEFAULT_STEP_DESCRIPTION,
      lastEdited: Date.now(),
      workflowTemplateId: editedWorkflow.id,
      branches: [],
    };

    const updatedCurrentStep = {
      ...currentStep,
      branches: [
        ...(currentStep.branches || []),
        {
          stepId: currentStep.id,
          targetStepId: newStepId,
          condition: undefined,
        },
      ],
    };

    let newWorkflow: WorkflowTemplate | null = null;

    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps.map((step) =>
        step.id === stepId ? updatedCurrentStep : step
      );

      newWorkflow = {
        ...prev,
        steps: [...updatedSteps, newStep],
      };

      return newWorkflow;
    });

    setHasChanges(true);
    setSelectedStepId(newStepId);

    if (newWorkflow) {
      captureCurrentState(newWorkflow);
    }
  };

  const handleInsertNodeBetween = useCallback(
    (sourceStepId: string, targetStepId: string, branchId?: string) => {
      let newStepId = '';

      setEditedWorkflow((prev) => {
        if (!prev) return prev;

        const sourceStep = prev.steps.find((s) => s.id === sourceStepId);
        if (!sourceStep?.branches) return prev;

        const branchIndex = sourceStep.branches.findIndex(
          (b) =>
            (branchId !== undefined && b.id === branchId) ||
            b.targetStepId === targetStepId
        );

        newStepId = `step-${sourceStepId}-${targetStepId}-insert`;

        if (branchIndex === -1) return prev;

        const newStep = {
          id: newStepId,
          name: DEFAULT_STEP_NAME,
          description: DEFAULT_STEP_DESCRIPTION,
          lastEdited: Date.now(),
          workflowTemplateId: prev.id,
          branches: [{ stepId: newStepId, targetStepId, condition: undefined }],
        };

        const updatedSteps = prev.steps.map((step) => {
          if (step.id === sourceStepId && step.branches) {
            return {
              ...step,
              branches: step.branches.map((branch, idx) =>
                idx === branchIndex
                  ? { ...branch, targetStepId: newStepId }
                  : branch
              ),
            };
          }
          return step;
        });

        const result = { ...prev, steps: [...updatedSteps, newStep] };
        console.log(
          'steps after insert:',
          JSON.stringify(
            result.steps.map((s) => ({
              id: s.id,
              name: s.name,
              branches: s.branches?.map((b) => ({
                from: b.stepId,
                to: b.targetStepId,
              })),
            })),
            null,
            2
          )
        );
        return result;
      });

      setHasChanges(true);
      setSelectedStepId(newStepId);
    },
    [setEditedWorkflow, setHasChanges, setSelectedStepId]
  );

  const handleDeleteNode = (stepId: string) => {
    if (!editedWorkflow) return;

    if (stepId === editedWorkflow.startingStepId) {
      showToast('Cannot delete the starting step');
      return;
    }

    const incomingConnections = new Map<string, string[]>();
    editedWorkflow.steps.forEach((step) => {
      if (step.branches) {
        step.branches.forEach((branch) => {
          const parents = incomingConnections.get(branch.targetStepId) || [];
          parents.push(step.id);
          incomingConnections.set(branch.targetStepId, parents);
        });
      }
    });

    const deletedStep = editedWorkflow.steps.find((s) => s.id === stepId);
    const singleChild =
      deletedStep?.branches?.length === 1
        ? deletedStep.branches[0].targetStepId
        : null;

    const nodesToDelete = new Set<string>();
    const visited = new Set<string>();

    const dfsToDelete = (currentStepId: string) => {
      if (visited.has(currentStepId)) return;

      if (singleChild && currentStepId === singleChild) return;

      visited.add(currentStepId);
      nodesToDelete.add(currentStepId);

      const currentStep = editedWorkflow.steps.find(
        (s) => s.id === currentStepId
      );
      if (!currentStep?.branches) return;

      currentStep.branches.forEach((branch) => {
        const targetStepId = branch.targetStepId;
        const parents = incomingConnections.get(targetStepId) || [];

        const hasOnlyThisParent =
          parents.length === 1 && parents[0] === currentStepId;

        const allParentsDeleted = parents.every(
          (parentId) =>
            nodesToDelete.has(parentId) || parentId === currentStepId
        );

        if (hasOnlyThisParent || allParentsDeleted) {
          dfsToDelete(targetStepId);
        }
      });
    };

    dfsToDelete(stepId);

    let newWorkflow: WorkflowTemplate | null = null;

    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps
        .filter((step) => !nodesToDelete.has(step.id))
        .map((step) => {
          if (step.branches) {
            const updatedBranches = step.branches
              .map((branch) => {
                if (singleChild && branch.targetStepId === stepId) {
                  return { ...branch, targetStepId: singleChild };
                }
                return branch;
              })
              .filter((branch) => !nodesToDelete.has(branch.targetStepId));
            return {
              ...step,
              branches: updatedBranches,
            };
          }
          return step;
        });

      newWorkflow = {
        ...prev,
        steps: updatedSteps,
      };

      return newWorkflow;
    });

    setHasChanges(true);

    if (nodesToDelete.has(selectedStepId || '')) {
      clearSelectedStep();
    }

    if (newWorkflow) {
      captureCurrentState(newWorkflow);
    }
  };

  return {
    handleInsertNode,
    handleInsertNodeBetween,
    handleDeleteNode,
  };
};

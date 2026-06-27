import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';

const DEFAULT_BRANCH_STEP_NAME = 'New Branch Step';
const DEFAULT_STEP_DESCRIPTION = '';

export interface UseWorkflowBranchMutationsOptions {
  editedWorkflow: WorkflowTemplate | null;
  setEditedWorkflow: React.Dispatch<
    React.SetStateAction<WorkflowTemplate | null>
  >;
  setHasChanges: (value: boolean) => void;
  setSelectedStepId: (stepId: string) => void;
  setSelectedBranchIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  captureCurrentState: (workflow: WorkflowTemplate) => void;
}

export const useWorkflowBranchMutations = ({
  editedWorkflow,
  setEditedWorkflow,
  setHasChanges,
  setSelectedStepId,
  setSelectedBranchIndex,
  captureCurrentState,
}: UseWorkflowBranchMutationsOptions) => {
  const handleBranchChange = (
    stepId: string,
    branchIndex: number,
    conditionRule: string,
    conditionName?: string
  ) => {
    if (!editedWorkflow) return;

    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps?.map((step) => {
        if (step.id === stepId && step.branches) {
          const updatedBranches = step.branches.map((branch, idx) => {
            if (idx === branchIndex) {
              let ruleWithName = conditionRule;
              if (conditionRule) {
                try {
                  const ruleObj = JSON.parse(conditionRule);
                  if (conditionName) {
                    ruleObj.name = conditionName;
                  } else {
                    delete ruleObj.name;
                  }
                  ruleWithName = JSON.stringify(ruleObj);
                } catch {
                  ruleWithName = conditionRule;
                }
              }

              return {
                ...branch,
                condition: {
                  id: branch.condition?.id || `condition-${Date.now()}`,
                  rule: ruleWithName,
                },
              };
            }
            return branch;
          });
          return { ...step, branches: updatedBranches };
        }
        return step;
      });

      return {
        ...prev,
        steps: updatedSteps,
      };
    });
    setHasChanges(true);
  };

  const handleAddBranch = (stepId: string) => {
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
      name: DEFAULT_BRANCH_STEP_NAME,
      description: DEFAULT_STEP_DESCRIPTION,
      lastEdited: Date.now(),
      workflowTemplateId: editedWorkflow.id,
      branches: [],
    };

    const newBranch = {
      stepId: stepId,
      targetStepId: newStepId,
      condition: undefined,
    };

    const updatedCurrentStep = {
      ...currentStep,
      branches: currentStep.branches
        ? [...currentStep.branches, newBranch]
        : [newBranch],
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

  const handleConnectionCreate = (
    sourceStepId: string,
    targetStepId: string
  ) => {
    if (!editedWorkflow) return;

    const sourceStep = editedWorkflow.steps.find((s) => s.id === sourceStepId);
    if (!sourceStep) {
      return;
    }

    const newBranch = {
      stepId: sourceStepId,
      targetStepId: targetStepId,
      condition: undefined,
    };

    const updatedSourceStep = {
      ...sourceStep,
      branches: sourceStep.branches
        ? [...sourceStep.branches, newBranch]
        : [newBranch],
    };

    let newWorkflow: WorkflowTemplate | null = null;

    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps.map((step) =>
        step.id === sourceStepId ? updatedSourceStep : step
      );

      newWorkflow = {
        ...prev,
        steps: updatedSteps,
      };

      return newWorkflow;
    });

    setHasChanges(true);

    if (newWorkflow) {
      captureCurrentState(newWorkflow);
    }
  };

  const handleTargetStepChange = (
    stepId: string,
    branchIndex: number,
    targetStepId: string
  ) => {
    if (!editedWorkflow) {
      return;
    }

    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps?.map((step) => {
        if (step.id === stepId && step.branches) {
          const updatedBranches = step.branches.map((branch, idx) => {
            if (idx === branchIndex) {
              return {
                ...branch,
                targetStepId: targetStepId,
              };
            }
            return branch;
          });
          return { ...step, branches: updatedBranches };
        }
        return step;
      });
      return {
        ...prev,
        steps: updatedSteps,
      };
    });
    setHasChanges(true);
  };

  const handleAddRule = (
    branchId: string,
    sourceStepId: string,
    targetStepId: string
  ) => {
    if (!editedWorkflow) return;

    const sourceStep = editedWorkflow.steps.find((s) => s.id === sourceStepId);
    if (!sourceStep?.branches) return;

    const branchIndex = sourceStep.branches.findIndex(
      (b) =>
        (branchId !== undefined && branchId !== '' && b.id === branchId) ||
        b.targetStepId === targetStepId
    );

    if (branchIndex === -1) return;

    setSelectedStepId(sourceStepId);
    setSelectedBranchIndex(branchIndex);
  };

  return {
    handleBranchChange,
    handleAddBranch,
    handleConnectionCreate,
    handleTargetStepChange,
    handleAddRule,
  };
};

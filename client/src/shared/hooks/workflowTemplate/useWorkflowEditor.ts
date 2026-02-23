import { useState } from 'react';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import { useUndoRedo } from 'src/shared/hooks/workflowTemplate/useUndoRedo';

// Default values for new workflow steps
const DEFAULT_STEP_NAME = 'New Step';
const DEFAULT_BRANCH_STEP_NAME = 'New Branch Step';
const DEFAULT_STEP_DESCRIPTION = 'Add description here';

export interface UseWorkflowEditorOptions {
  initialWorkflow: WorkflowTemplate | null;
  onSave: (workflow: WorkflowTemplate) => Promise<void>;
  onCancel?: () => void;
  enabled?: boolean;
}

export const useWorkflowEditor = ({
  initialWorkflow,
  onSave,
  onCancel,
  enabled = true,
}: UseWorkflowEditorOptions) => {
  const [editedWorkflow, setEditedWorkflow] = useState<WorkflowTemplate | null>(
    enabled ? initialWorkflow : null
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>();
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<
    number | undefined
  >();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Undo/Redo functionality
  const {
    init: initHistory,
    captureCurrentState,
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
  } = useUndoRedo(editedWorkflow, setEditedWorkflow);

  // Initialize the workflow editor
  const initializeEditor = (workflow: WorkflowTemplate) => {
    setEditedWorkflow({ ...workflow });
    setHasChanges(false);
    initHistory(workflow);
  };

  // Custom step selection that clears branch selection
  const handleStepSelect = (stepId: string) => {
    setSelectedStepId(stepId);
    setSelectedBranchIndex(undefined); // Clear branch selection when selecting a step
  };

  const handleFieldChange = (field: keyof WorkflowTemplate, value: any) => {
    if (!editedWorkflow) return;

    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      if (field === 'name') {
        return {
          ...prev,
          name: value,
          classification: prev.classification
            ? { ...prev.classification, name: value }
            : { id: prev.classificationId || '', name: value },
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
    setHasChanges(true);
  };

  const handleStepChange = (stepId: string, field: string, value: string) => {
    if (!editedWorkflow) return;

    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps?.map((step) => {
        if (step.id === stepId) {
          return { ...step, [field]: value };
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
              // Parse the existing rule to merge with the name
              let ruleWithName = conditionRule;
              if (conditionName) {
                try {
                  const ruleObj = JSON.parse(conditionRule);
                  ruleObj.name = conditionName;
                  ruleWithName = JSON.stringify(ruleObj);
                } catch {
                  // If parsing fails, just use the original rule
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

  const handleInsertNode = (stepId: string) => {
    if (!editedWorkflow) return;

    // Get the current step
    const currentStep = editedWorkflow.steps.find((s) => s.id === stepId);
    if (!currentStep) {
      return;
    }

    // Generate a unique ID for the new step
    const newStepId = `step-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create the new node (it starts with no children of its own)
    const newStep = {
      id: newStepId,
      name: DEFAULT_STEP_NAME,
      description: DEFAULT_STEP_DESCRIPTION,
      lastEdited: Date.now(),
      workflowTemplateId: editedWorkflow.id,
      branches: [],
    };

    //always append the new ID to the existing branches array
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

    // Capture the new workflow state
    let newWorkflow: WorkflowTemplate | null = null;

    // Update the workflow with the modifications
    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      // Replace the current step with updated version
      const updatedSteps = prev.steps.map((step) =>
        step.id === stepId ? updatedCurrentStep : step
      );

      // Add the new step to the array
      newWorkflow = {
        ...prev,
        steps: [...updatedSteps, newStep],
      };

      return newWorkflow;
    });

    setHasChanges(true);

    // Auto-select the newly created step
    setSelectedStepId(newStepId);

    // Capture state with the new workflow
    if (newWorkflow) {
      captureCurrentState(newWorkflow);
    }
  };

  const handleAddBranch = (stepId: string) => {
    if (!editedWorkflow) return;

    // Get the current step
    const currentStep = editedWorkflow.steps.find((s) => s.id === stepId);
    if (!currentStep) {
      return;
    }

    // Generate a unique ID for the new step
    const newStepId = `step-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create a new step that will be the target of the new branch
    const newStep = {
      id: newStepId,
      name: DEFAULT_BRANCH_STEP_NAME,
      description: DEFAULT_STEP_DESCRIPTION,
      lastEdited: Date.now(),
      workflowTemplateId: editedWorkflow.id,
      branches: [],
    };

    // Add a new branch to the current step
    const newBranch = {
      stepId: stepId,
      targetStepId: newStepId,
      condition: undefined,
    };

    // Add the new branch to the current step's branches
    const updatedCurrentStep = {
      ...currentStep,
      branches: currentStep.branches
        ? [...currentStep.branches, newBranch]
        : [newBranch],
    };

    // Capture the new workflow state
    let newWorkflow: WorkflowTemplate | null = null;

    // Update the workflow
    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      // Replace the current step with updated version
      const updatedSteps = prev.steps.map((step) =>
        step.id === stepId ? updatedCurrentStep : step
      );

      // Add the new step to the array
      newWorkflow = {
        ...prev,
        steps: [...updatedSteps, newStep],
      };

      return newWorkflow;
    });

    setHasChanges(true);

    // Auto-select the newly created step
    setSelectedStepId(newStepId);

    // Capture state with the new workflow
    if (newWorkflow) {
      captureCurrentState(newWorkflow);
    }
  };

  const handleConnectionCreate = (
    sourceStepId: string,
    targetStepId: string
  ) => {
    if (!editedWorkflow) return;

    // Find the source step
    const sourceStep = editedWorkflow.steps.find((s) => s.id === sourceStepId);
    if (!sourceStep) {
      return;
    }

    // Create a new branch for the connection
    const newBranch = {
      stepId: sourceStepId,
      targetStepId: targetStepId,
      condition: undefined,
    };

    // Add the new branch to the source step
    const updatedSourceStep = {
      ...sourceStep,
      branches: sourceStep.branches
        ? [...sourceStep.branches, newBranch]
        : [newBranch],
    };

    // Capture the new workflow state
    let newWorkflow: WorkflowTemplate | null = null;

    // Update the workflow
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

    // Capture state with the new workflow
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
      const newWorkflow = {
        ...prev,
        steps: updatedSteps,
      };
      return newWorkflow;
    });
    setHasChanges(true);
  };
  const handleDeleteNode = (stepId: string) => {
    if (!editedWorkflow) return;

    if (stepId === editedWorkflow.startingStepId) {
      setToastMsg('Cannot delete the starting step');
      setToastOpen(true);
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

    // DFS to collect all nodes to delete
    const nodesToDelete = new Set<string>();
    const visited = new Set<string>();

    const dfsToDelete = (currentStepId: string) => {
      if (visited.has(currentStepId)) return;

      visited.add(currentStepId);
      nodesToDelete.add(currentStepId);

      const currentStep = editedWorkflow.steps.find(
        (s) => s.id === currentStepId
      );
      if (!currentStep?.branches) return;

      currentStep.branches.forEach((branch) => {
        const targetStepId = branch.targetStepId;
        const parents = incomingConnections.get(targetStepId) || [];

        // DFS continue only if the target has only one parent (the current node)
        const hasOnlyThisParent =
          parents.length === 1 && parents[0] === currentStepId;

        // Or if all parents marked for deletion
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

    // Capture the new workflow state
    let newWorkflow: WorkflowTemplate | null = null;

    // Remove all nodes to delete from the workflow
    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps
        .filter((step) => !nodesToDelete.has(step.id))
        .map((step) => {
          if (step.branches) {
            const cleanedBranches = step.branches.filter(
              (branch) => !nodesToDelete.has(branch.targetStepId)
            );
            return {
              ...step,
              branches: cleanedBranches.length > 0 ? cleanedBranches : [],
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

    // Clear selected step if it was deleted
    if (nodesToDelete.has(selectedStepId || '')) {
      setSelectedStepId(undefined);
    }

    // Capture state with the new workflow
    if (newWorkflow) {
      captureCurrentState(newWorkflow);
    }
  };

  const handleSave = async () => {
    if (!editedWorkflow || !hasChanges) return;
    await onSave(editedWorkflow);
    clearHistory();
  };

  const handleCancel = () => {
    setEditedWorkflow(null);
    setHasChanges(false);
    clearHistory();
    onCancel?.();
  };

  const handleAddRule = (
    branchId: string,
    sourceStepId: string,
    targetStepId: string
  ) => {
    if (!editedWorkflow) return;

    // Find the branch index for this specific branch
    const sourceStep = editedWorkflow.steps.find((s) => s.id === sourceStepId);
    if (!sourceStep?.branches) return;

    const branchIndex = sourceStep.branches.findIndex(
      (b) =>
        b.id === branchId ||
        (b.stepId === sourceStepId && b.targetStepId === targetStepId)
    );

    if (branchIndex === -1) return;

    // Select the source step and the specific branch
    setSelectedStepId(sourceStepId);
    setSelectedBranchIndex(branchIndex);
  };

  return {
    editedWorkflow,
    hasChanges,
    selectedStepId,
    setSelectedStepId: handleStepSelect,
    selectedBranchIndex,
    onTargetStepChange: handleTargetStepChange,
    setSelectedBranchIndex,
    toastOpen,
    setToastOpen,
    toastMsg,
    setToastMsg,
    handleFieldChange,
    handleStepChange,
    handleBranchChange,
    handleInsertNode,
    handleAddBranch,
    handleConnectionCreate,
    handleDeleteNode,
    handleAddRule,
    handleSave,
    handleCancel,
    initializeEditor,
    // Undo/Redo
    canUndo,
    canRedo,
    undo,
    redo,
  };
};

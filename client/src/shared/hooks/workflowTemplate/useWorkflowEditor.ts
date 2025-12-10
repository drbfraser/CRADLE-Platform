import { useState } from 'react';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import { useUndoRedo } from 'src/shared/hooks/workflowTemplate/useUndoRedo';

// Default values for new workflow steps
const DEFAULT_STEP_NAME = 'New Step';
const DEFAULT_BRANCH_STEP_NAME = 'New Branch Step';
const DEFAULT_STEP_DESCRIPTION = 'Add description here';

/**
 * Helper function to extract data sources (var fields) from a condition rule JSON
 * Example: {"<": [{"var": "patient.age"}, 32]} => '["patient.age"]'
 * TODO: Replace with a more generic function that can handle all condition types
 */
const extractDataSources = (ruleJSON: string): string => {
  try {
    const rule = JSON.parse(ruleJSON);
    const dataSources: string[] = [];

    // Recursive function to find all "var" properties
    const findVars = (obj: any) => {
      if (typeof obj === 'object' && obj !== null) {
        if ('var' in obj && typeof obj.var === 'string') {
          dataSources.push(obj.var);
        }
        // Recursively search in nested objects and arrays
        Object.values(obj).forEach((value) => {
          if (typeof value === 'object') {
            findVars(value);
          }
        });
      }
    };

    findVars(rule);
    // Return JSON string representation of the array
    return JSON.stringify(dataSources);
  } catch (error) {
    console.error('Failed to extract data sources from rule:', error);
    return '[]';
  }
};

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

  const handleFieldChange = (field: keyof WorkflowTemplate, value: any) => {
    if (!editedWorkflow) return;

    setEditedWorkflow((prev) => ({
      ...prev!,
      [field]: value,
    }));
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
    conditionRule: string
  ) => {
    if (!editedWorkflow) return;

    // Extract data sources from the condition rule as a JSON string
    const dataSourcesJSON = extractDataSources(conditionRule);

    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps?.map((step) => {
        if (step.id === stepId && step.branches) {
          const updatedBranches = step.branches.map((branch, idx) => {
            if (idx === branchIndex) {
              return {
                ...branch,
                condition: {
                  id: branch.condition?.id || `condition-${Date.now()}`,
                  rule: conditionRule,
                  data_sources: dataSourcesJSON,
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

    // Determine the next step connections
    const newStepBranches =
      currentStep.branches && currentStep.branches.length > 0
        ? currentStep.branches.map((branch) => ({
            ...branch,
            stepId: newStepId,
          }))
        : [];

    // Create a new step
    const newStep = {
      id: newStepId,
      name: DEFAULT_STEP_NAME,
      description: DEFAULT_STEP_DESCRIPTION,
      lastEdited: Date.now(),
      workflowTemplateId: editedWorkflow.id,
      branches: newStepBranches,
    };

    // Update current step to point all its branches to the new step
    const updatedCurrentStep = {
      ...currentStep,
      branches:
        currentStep.branches && currentStep.branches.length > 0
          ? currentStep.branches.map((branch) => ({
              ...branch,
              targetStepId: newStepId,
            }))
          : [{ stepId: currentStep.id, targetStepId: newStepId }],
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

  return {
    editedWorkflow,
    hasChanges,
    selectedStepId,
    setSelectedStepId,
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

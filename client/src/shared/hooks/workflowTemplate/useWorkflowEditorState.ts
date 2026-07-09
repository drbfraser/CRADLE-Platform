import { useState } from 'react';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';

export interface UseWorkflowEditorStateOptions {
  initialWorkflow: WorkflowTemplate | null;
  enabled: boolean;
}

export const useWorkflowEditorState = ({
  initialWorkflow,
  enabled,
}: UseWorkflowEditorStateOptions) => {
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

  const initializeEditor = (workflow: WorkflowTemplate) => {
    setEditedWorkflow({ ...workflow });
    setHasChanges(false);
  };

  const handleStepSelect = (stepId: string) => {
    setSelectedStepId(stepId);
    setSelectedBranchIndex(undefined);
  };

  const clearSelectedStep = () => {
    setSelectedStepId(undefined);
  };

  const handleFieldChange = (field: keyof WorkflowTemplate, value: unknown) => {
    if (!editedWorkflow) return;

    setEditedWorkflow((prev) => {
      if (!prev) return prev;

      if (field === 'name') {
        return {
          ...prev,
          name: value as string,
          classification: prev.classification
            ? { ...prev.classification, name: value as string }
            : { id: prev.classificationId || '', name: value as string },
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

  return {
    editedWorkflow,
    setEditedWorkflow,
    hasChanges,
    setHasChanges,
    selectedStepId,
    setSelectedStepId: handleStepSelect,
    selectedBranchIndex,
    setSelectedBranchIndex,
    toastOpen,
    setToastOpen,
    toastMsg,
    setToastMsg,
    initializeEditor,
    handleFieldChange,
    handleStepChange,
    clearSelectedStep,
  };
};

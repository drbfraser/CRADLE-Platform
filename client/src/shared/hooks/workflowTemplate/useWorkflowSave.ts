import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';

export interface UseWorkflowSaveOptions {
  editedWorkflow: WorkflowTemplate | null;
  hasChanges: boolean;
  setEditedWorkflow: React.Dispatch<
    React.SetStateAction<WorkflowTemplate | null>
  >;
  setHasChanges: (value: boolean) => void;
  onSave: (workflow: WorkflowTemplate) => Promise<void>;
  onCancel?: () => void;
  clearHistory: () => void;
}

export const useWorkflowSave = ({
  editedWorkflow,
  hasChanges,
  setEditedWorkflow,
  setHasChanges,
  onSave,
  onCancel,
  clearHistory,
}: UseWorkflowSaveOptions) => {
  const handleSave = async () => {
    if (!editedWorkflow || !hasChanges) return;
    try {
      await onSave(editedWorkflow);
      clearHistory();
    } catch (error) {
      // onSave already surfaces the failure to the user (e.g. via the
      // mutation's own isError state or a toast) - this only stops the
      // rejection from propagating as an unhandled promise rejection.
      console.error('Error saving workflow:', error);
    }
  };

  const handleCancel = () => {
    setEditedWorkflow(null);
    setHasChanges(false);
    clearHistory();
    onCancel?.();
  };

  return {
    handleSave,
    handleCancel,
  };
};

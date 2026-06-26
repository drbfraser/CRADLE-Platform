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
    handleSave,
    handleCancel,
  };
};

import { useCallback } from 'react';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import { useUndoRedo } from 'src/shared/hooks/workflowTemplate/useUndoRedo';
import { useWorkflowEditorState } from 'src/shared/hooks/workflowTemplate/useWorkflowEditorState';
import { useWorkflowStepMutations } from 'src/shared/hooks/workflowTemplate/useWorkflowStepMutations';
import { useWorkflowBranchMutations } from 'src/shared/hooks/workflowTemplate/useWorkflowBranchMutations';
import { useWorkflowSave } from 'src/shared/hooks/workflowTemplate/useWorkflowSave';

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
  const editorState = useWorkflowEditorState({
    initialWorkflow,
    enabled,
  });

  const {
    editedWorkflow,
    setEditedWorkflow,
    hasChanges,
    setHasChanges,
    selectedStepId,
    setSelectedStepId,
    selectedBranchIndex,
    setSelectedBranchIndex,
    toastOpen,
    setToastOpen,
    toastMsg,
    setToastMsg,
    initializeEditor: initializeEditorState,
    handleFieldChange,
    handleStepChange,
    clearSelectedStep,
  } = editorState;

  const {
    init: initHistory,
    captureCurrentState,
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
  } = useUndoRedo(editedWorkflow, setEditedWorkflow);

  const initializeEditor = useCallback(
    (workflow: WorkflowTemplate) => {
      initializeEditorState(workflow);
      initHistory(workflow);
    },
    [initializeEditorState, initHistory]
  );

  const showToast = useCallback(
    (message: string) => {
      setToastMsg(message);
      setToastOpen(true);
    },
    [setToastMsg, setToastOpen]
  );

  const { handleInsertNode, handleInsertNodeBetween, handleDeleteNode } =
    useWorkflowStepMutations({
      editedWorkflow,
      setEditedWorkflow,
      setHasChanges,
      setSelectedStepId,
      clearSelectedStep,
      selectedStepId,
      captureCurrentState,
      showToast,
    });

  const {
    handleBranchChange,
    handleAddBranch,
    handleConnectionCreate,
    handleTargetStepChange,
    handleAddRule,
  } = useWorkflowBranchMutations({
    editedWorkflow,
    setEditedWorkflow,
    setHasChanges,
    setSelectedStepId,
    setSelectedBranchIndex,
    captureCurrentState,
  });

  const { handleSave, handleCancel } = useWorkflowSave({
    editedWorkflow,
    hasChanges,
    setEditedWorkflow,
    setHasChanges,
    onSave,
    onCancel,
    clearHistory,
  });

  return {
    editedWorkflow,
    hasChanges,
    selectedStepId,
    setSelectedStepId,
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
    handleInsertNodeBetween,
    handleAddBranch,
    handleConnectionCreate,
    handleDeleteNode,
    handleAddRule,
    handleSave,
    handleCancel,
    initializeEditor,
    onCaptureState: captureCurrentState,
    canUndo,
    canRedo,
    undo,
    redo,
  };
};

import {
  Box,
  Typography,
  Divider,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import { WorkflowViewMode } from 'src/shared/types/workflow/workflowEnums';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { WorkflowFlowView } from 'src/shared/components/workflow/workflowTemplate/WorkflowFlowView';
import { WorkflowSteps } from 'src/shared/components/workflow/WorkflowSteps';
import { WorkflowEditorController } from 'src/shared/hooks/workflowTemplate/useWorkflowEditor';

interface WorkflowEditorProps {
  editor: WorkflowEditorController;
  allowClassificationEdit?: boolean;
  isSaving?: boolean;
  saveDisabled?: boolean;
  showViewToggle?: boolean;
  viewMode?: WorkflowViewMode;
  onViewModeChange?: (mode: WorkflowViewMode) => void;
}

export const WorkflowEditor = ({
  editor,
  allowClassificationEdit = false,
  isSaving = false,
  saveDisabled = false,
  showViewToggle = false,
  viewMode = WorkflowViewMode.FLOW,
  onViewModeChange,
}: WorkflowEditorProps) => {
  const workflow = editor.editedWorkflow;
  if (!workflow) return null;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={editor.handleCancel}
            disabled={isSaving}>
            Discard
          </Button>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={editor.handleSave}
            disabled={
              !editor.hasChanges ||
              isSaving ||
              saveDisabled ||
              !workflow.name?.trim()
            }>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>

      {editor.hasChanges && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have unsaved changes. Don&apos;t forget to save your work!
        </Alert>
      )}

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>
        Workflow Template Basic Info
      </Typography>

      <WorkflowMetadata
        classificationName={workflow.name}
        description={workflow.description}
        version={workflow.version}
        lastEdited={workflow.lastEdited}
        archived={workflow.archived}
        dateCreated={workflow.dateCreated}
        isEditMode={true}
        isClassificationEditable={allowClassificationEdit}
        onFieldChange={editor.handleFieldChange}
      />

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}>
        <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
          {`Workflow Template Steps${
            typeof workflow.steps?.length === 'number'
              ? ` (${workflow.steps.length})`
              : ''
          }`}
        </Typography>

        {showViewToggle && onViewModeChange && (
          <Stack direction="row" spacing={1}>
            <Button
              variant={
                viewMode === WorkflowViewMode.FLOW ? 'contained' : 'outlined'
              }
              size="small"
              onClick={() => onViewModeChange(WorkflowViewMode.FLOW)}
              disabled={true}>
              Flow View
            </Button>
            <Button
              variant={
                viewMode === WorkflowViewMode.LIST ? 'contained' : 'outlined'
              }
              size="small"
              onClick={() => onViewModeChange(WorkflowViewMode.LIST)}
              disabled={true}>
              List View
            </Button>
          </Stack>
        )}
      </Box>

      {viewMode === WorkflowViewMode.FLOW || !showViewToggle ? (
        <WorkflowFlowView
          steps={workflow.steps as WorkflowTemplateStepWithFormAndIndex[]}
          firstStepId={workflow.startingStepId || ''}
          isInstance={false}
          isEditMode={true}
          selectedStepId={editor.selectedStepId}
          selectedBranchIndex={editor.selectedBranchIndex}
          onStepSelect={editor.setSelectedStepId}
          setSelectedStepId={
            editor.setSelectedStepId as (stepId: string | undefined) => void
          }
          setSelectedBranchIndex={editor.setSelectedBranchIndex}
          onStepChange={editor.handleStepChange}
          onCaptureState={editor.onCaptureState}
          onBranchChange={editor.handleBranchChange}
          onTargetStepChange={editor.onTargetStepChange}
          onInsertNode={editor.handleInsertNode}
          onAddBranch={editor.handleAddBranch}
          onConnectionCreate={editor.handleConnectionCreate}
          onInsertNodeBetween={editor.handleInsertNodeBetween}
          onDeleteNode={editor.handleDeleteNode}
          onAddRule={editor.handleAddRule}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onUndo={editor.undo}
          onRedo={editor.redo}
        />
      ) : (
        <WorkflowSteps
          steps={workflow.steps as WorkflowTemplateStepWithFormAndIndex[]}
          firstStep={workflow.startingStepId || ''}
          isInstance={false}
        />
      )}
    </>
  );
};

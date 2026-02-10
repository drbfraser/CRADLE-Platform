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
import {
  WorkflowTemplate,
  WorkflowTemplateStepWithFormAndIndex,
} from 'src/shared/types/workflow/workflowApiTypes';
import { WorkflowViewMode } from 'src/shared/types/workflow/workflowEnums';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { WorkflowFlowView } from 'src/shared/components/workflow/workflowTemplate/WorkflowFlowView';
import { WorkflowSteps } from 'src/shared/components/workflow/WorkflowSteps';

interface WorkflowEditorProps {
  workflow: WorkflowTemplate | null;
  collectionName?: string;
  hasChanges: boolean;
  selectedStepId?: string;
  selectedBranchIndex?: number;
  onStepSelect: (stepId: string) => void;
  onFieldChange: (field: keyof WorkflowTemplate, value: any) => void;
  onStepChange: (stepId: string, field: string, value: string) => void;
  onBranchChange: (
    stepId: string,
    branchIndex: number,
    conditionRule: string
  ) => void;
  onInsertNode: (stepId: string) => void;
  onAddBranch: (stepId: string) => void;
  onConnectionCreate: (sourceStepId: string, targetStepId: string) => void;
  onDeleteNode: (stepId: string) => void;
  onAddRule?: (
    branchId: string,
    sourceStepId: string,
    targetStepId: string
  ) => void;
  onSave: () => void;
  onCancel: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isSaving?: boolean;
  saveDisabled?: boolean;
  showViewToggle?: boolean;
  viewMode?: WorkflowViewMode;
  onViewModeChange?: (mode: WorkflowViewMode) => void;
}

export const WorkflowEditor = ({
  workflow,
  collectionName,
  hasChanges,
  selectedStepId,
  selectedBranchIndex,
  onStepSelect,
  onFieldChange,
  onStepChange,
  onBranchChange,
  onInsertNode,
  onAddBranch,
  onConnectionCreate,
  onDeleteNode,
  onAddRule,
  onSave,
  onCancel,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isSaving = false,
  saveDisabled = false,
  showViewToggle = false,
  viewMode = WorkflowViewMode.FLOW,
  onViewModeChange,
}: WorkflowEditorProps) => {
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
            onClick={onCancel}
            disabled={isSaving}>
            Discard
          </Button>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={onSave}
            disabled={!hasChanges || isSaving || saveDisabled}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>

      {hasChanges && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have unsaved changes. Don&apos;t forget to save your work!
        </Alert>
      )}

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>
        Workflow Template Basic Info
      </Typography>

      <WorkflowMetadata
        name={workflow.name}
        description={workflow.description}
        collectionName={collectionName}
        version={workflow.version}
        lastEdited={workflow.lastEdited}
        archived={workflow.archived}
        dateCreated={workflow.dateCreated}
        isEditMode={true}
        onFieldChange={onFieldChange}
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
          selectedStepId={selectedStepId}
          selectedBranchIndex={selectedBranchIndex}
          onStepSelect={onStepSelect}
          onStepChange={onStepChange}
          onBranchChange={onBranchChange}
          onInsertNode={onInsertNode}
          onAddBranch={onAddBranch}
          onConnectionCreate={onConnectionCreate}
          onDeleteNode={onDeleteNode}
          onAddRule={onAddRule}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
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

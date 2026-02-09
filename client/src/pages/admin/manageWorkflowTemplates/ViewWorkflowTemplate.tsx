import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  WorkflowTemplateStepWithFormAndIndex,
  WorkflowTemplate,
} from 'src/shared/types/workflow/workflowApiTypes';
import { WorkflowViewMode } from 'src/shared/types/workflow/workflowEnums';
import { getTemplateWithStepsAndClassification } from 'src/shared/api/modules/workflowTemplates';
import { WorkflowMetadata } from 'src/shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { WorkflowSteps } from 'src/shared/components/workflow/WorkflowSteps';
import { WorkflowFlowView } from 'src/shared/components/workflow/workflowTemplate/WorkflowFlowView';
import { WorkflowEditor } from 'src/shared/components/workflow/workflowTemplate/WorkflowEditor';
import { useWorkflowEditor } from 'src/shared/hooks/workflowTemplate/useWorkflowEditor';
import { useEditWorkflowTemplate } from './mutations';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';

export const ViewWorkflowTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewWorkflow = location.state?.viewWorkflow;

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<WorkflowViewMode>(
    WorkflowViewMode.FLOW
  );

  // Fetch the workflow template data to ensure it's always up-to-date
  const workflowTemplateQuery = useQuery({
    queryKey: ['workflowTemplate', viewWorkflow?.id],
    queryFn: async (): Promise<WorkflowTemplate> => {
      if (!viewWorkflow?.id)
        throw new Error('No workflow template ID provided');
      const result = await getTemplateWithStepsAndClassification(
        viewWorkflow.id
      );
      return result;
    },
    enabled: !!viewWorkflow?.id,
    initialData: viewWorkflow,
  });

  const editWorkflowTemplateMutation = useEditWorkflowTemplate();

  // Workflow editor hook
  const workflowEditor = useWorkflowEditor({
    initialWorkflow: workflowTemplateQuery.data || null,
    enabled: isEditMode,
    onSave: async (workflow) => {
      // Frontend guard: require version bump to avoid 409 from backend
      const originalVersion = workflowTemplateQuery.data?.version;
      if (workflow.version === originalVersion) {
        workflowEditor.setToastMsg(
          'Please change the version before saving. A template with this version already exists.'
        );
        workflowEditor.setToastOpen(true);
        throw new Error('Version must be changed');
      }

      await editWorkflowTemplateMutation.mutateAsync({
        template: workflow,
      });

      // Redirect to workflow templates page after successful save
      navigate('/admin/workflow-templates');
    },
    onCancel: () => setIsEditMode(false),
  });

  // Initialize editor when entering edit mode
  useEffect(() => {
    if (
      isEditMode &&
      workflowTemplateQuery.data &&
      !workflowEditor.editedWorkflow
    ) {
      workflowEditor.initializeEditor({ ...workflowTemplateQuery.data });
    }
  }, [isEditMode, workflowTemplateQuery.data]);

  const isLoading = workflowTemplateQuery.isPending;

  const dash = (v?: string) => (v && String(v).trim() ? v : '—');
  const collectionName = useMemo(
    () => dash(workflowTemplateQuery.data?.classification?.name),
    [workflowTemplateQuery.data]
  );

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const currentWorkflow = isEditMode
    ? workflowEditor.editedWorkflow
    : workflowTemplateQuery.data;

  return (
    <>
      {(workflowTemplateQuery.isError ||
        editWorkflowTemplateMutation.isError) && <APIErrorToast />}

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Go back" placement="top">
              <IconButton
                onClick={() => navigate(`/admin/workflow-templates`)}
                size="medium">
                <ChevronLeftIcon color="inherit" fontSize="large" />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" component="h2" sx={{ ml: 0.5 }}>
              Workflow Template: {dash(currentWorkflow?.name)}
            </Typography>
          </Box>

          {!isEditMode && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={workflowTemplateQuery.data?.archived}>
              Edit
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {isEditMode ? (
          <WorkflowEditor
            workflow={workflowEditor.editedWorkflow}
            collectionName={collectionName}
            hasChanges={workflowEditor.hasChanges}
            selectedStepId={workflowEditor.selectedStepId}
            onStepSelect={workflowEditor.setSelectedStepId}
            onFieldChange={workflowEditor.handleFieldChange}
            onStepChange={workflowEditor.handleStepChange}
            onBranchChange={workflowEditor.handleBranchChange}
            onInsertNode={workflowEditor.handleInsertNode}
            onAddBranch={workflowEditor.handleAddBranch}
            onConnectionCreate={workflowEditor.handleConnectionCreate}
            onDeleteNode={workflowEditor.handleDeleteNode}
            onAddRule={workflowEditor.handleAddRule}
            onSave={workflowEditor.handleSave}
            onCancel={workflowEditor.handleCancel}
            canUndo={workflowEditor.canUndo}
            canRedo={workflowEditor.canRedo}
            onUndo={workflowEditor.undo}
            onRedo={workflowEditor.redo}
            isSaving={editWorkflowTemplateMutation.isPending}
          />
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>
              Workflow Template Basic Info
            </Typography>

            <WorkflowMetadata
              name={currentWorkflow?.name}
              description={currentWorkflow?.description}
              collectionName={collectionName}
              version={currentWorkflow?.version}
              lastEdited={currentWorkflow?.lastEdited}
              archived={currentWorkflow?.archived}
              dateCreated={currentWorkflow?.dateCreated}
              isEditMode={false}
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
                  typeof workflowTemplateQuery.data?.steps?.length === 'number'
                    ? ` (${workflowTemplateQuery.data.steps.length})`
                    : ''
                }`}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant={
                    viewMode === WorkflowViewMode.FLOW
                      ? 'contained'
                      : 'outlined'
                  }
                  size="small"
                  onClick={() => setViewMode(WorkflowViewMode.FLOW)}>
                  Flow View
                </Button>
                <Button
                  variant={
                    viewMode === WorkflowViewMode.LIST
                      ? 'contained'
                      : 'outlined'
                  }
                  size="small"
                  onClick={() => setViewMode(WorkflowViewMode.LIST)}>
                  List View
                </Button>
              </Stack>
            </Box>

            {isLoading ? (
              <Skeleton variant="rectangular" height={400} />
            ) : viewMode === WorkflowViewMode.FLOW ? (
              <WorkflowFlowView
                steps={
                  currentWorkflow?.steps as WorkflowTemplateStepWithFormAndIndex[]
                }
                firstStepId={currentWorkflow?.startingStepId || ''}
                isInstance={false}
                isEditMode={false}
              />
            ) : (
              <WorkflowSteps
                steps={
                  currentWorkflow?.steps as WorkflowTemplateStepWithFormAndIndex[]
                }
                firstStep={currentWorkflow?.startingStepId}
                isInstance={false}
              />
            )}
          </>
        )}
      </Paper>
      <Toast
        severity="warning"
        message={workflowEditor.toastMsg}
        open={workflowEditor.toastOpen}
        onClose={() => workflowEditor.setToastOpen(false)}
      />
    </>
  );
};

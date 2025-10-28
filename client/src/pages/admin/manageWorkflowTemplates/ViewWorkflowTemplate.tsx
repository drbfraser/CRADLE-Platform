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
  Alert,
  CircularProgress,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  WorkflowTemplateStepWithFormAndIndex,
  WorkflowTemplate,
} from 'src/shared/types/workflow/workflowApiTypes';
import { WorkflowViewMode } from 'src/shared/types/workflow/workflowEnums';
import { getTemplateWithStepsAndClassification } from 'src/shared/api/modules/workflowTemplates';
import { WorkflowMetadata } from '../../../shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { WorkflowSteps } from 'src/shared/components/workflow/WorkflowSteps';
import { WorkflowFlowView } from 'src/shared/components/workflow/workflowTemplate/WorkflowFlowView';
import { useEditWorkflowTemplate } from './mutations';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';

export const ViewWorkflowTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewWorkflow = location.state?.viewWorkflow;

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedWorkflow, setEditedWorkflow] = useState<WorkflowTemplate | null>(
    null
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>('');

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
      console.log('Workflow Template GET Response:', result);
      return result;
    },
    enabled: !!viewWorkflow?.id,
    initialData: viewWorkflow,
  });

  const editWorkflowTemplateMutation = useEditWorkflowTemplate();

  useEffect(() => {
    if (isEditMode && workflowTemplateQuery.data && !editedWorkflow) {
      setEditedWorkflow({ ...workflowTemplateQuery.data });
    }
  }, [isEditMode, workflowTemplateQuery.data, editedWorkflow]);

  const isLoading = workflowTemplateQuery.isPending;

  const dash = (v?: string) => (v && String(v).trim() ? v : '—');
  const collectionName = useMemo(
    () => dash(workflowTemplateQuery.data?.classification?.name),
    [workflowTemplateQuery.data]
  );

  // Edit mode functions
  const handleEdit = () => {
    setIsEditMode(true);
    setEditedWorkflow({ ...workflowTemplateQuery.data });
    setHasChanges(false);
  };

  // Cancel edit mode
  const handleCancel = () => {
    setIsEditMode(false);
    setEditedWorkflow(null);
    setHasChanges(false);
  };

  // handler for saving changes
  const handleSave = async () => {
    if (!editedWorkflow || !hasChanges) return;

    // Frontend guard: require version bump to avoid 409 from backend
    const originalVersion = workflowTemplateQuery.data?.version;
    if (editedWorkflow.version === originalVersion) {
      setToastMsg(
        'Please change the version before saving. A template with this version already exists.'
      );
      setToastOpen(true);
      return;
    }

    try {
      await editWorkflowTemplateMutation.mutateAsync({
        template: editedWorkflow,
      });
      // Redirect to workflow templates page after successful save
      navigate('/admin/workflow-templates');
    } catch (error: any) {
      console.error('Error saving workflow template:', error);
      return;
    }
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

  const handleInsertNode = (stepId: string) => {
    console.log('Insert node after step:', stepId);
    // TODO: Implement node insertion logic
    // This will create a new node after the selected step
  };

  const handleAddBranch = (stepId: string) => {
    console.log('Add branch to step:', stepId);
    // TODO: Implement branch addition logic
    // This will create a new branch for the selected step
  };

  const currentWorkflow = isEditMode
    ? editedWorkflow
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

          {!isEditMode ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={workflowTemplateQuery.data?.archived}>
              Edit
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={editWorkflowTemplateMutation.isPending}>
                Discard
              </Button>
              <Button
                variant="contained"
                startIcon={
                  editWorkflowTemplateMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={handleSave}
                disabled={
                  !hasChanges || editWorkflowTemplateMutation.isPending
                }>
                {editWorkflowTemplateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </Stack>
          )}
        </Box>

        {isEditMode && hasChanges && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You have unsaved changes. Don&apos;t forget to save your work!
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>
          Workflow Template Basic Info
        </Typography>

        {/* meta data display component */}
        <WorkflowMetadata
          name={currentWorkflow?.name}
          description={currentWorkflow?.description}
          collectionName={collectionName}
          version={currentWorkflow?.version}
          lastEdited={currentWorkflow?.lastEdited}
          archived={currentWorkflow?.archived}
          dateCreated={currentWorkflow?.dateCreated}
          isEditMode={isEditMode}
          onFieldChange={handleFieldChange}
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
                viewMode === WorkflowViewMode.FLOW ? 'contained' : 'outlined'
              }
              size="small"
              onClick={() => setViewMode(WorkflowViewMode.FLOW)}
              disabled={isEditMode}>
              Flow View
            </Button>
            <Button
              variant={
                viewMode === WorkflowViewMode.LIST ? 'contained' : 'outlined'
              }
              size="small"
              onClick={() => setViewMode(WorkflowViewMode.LIST)}
              disabled={isEditMode}>
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
            isEditMode={isEditMode}
            onStepChange={handleStepChange}
            onInsertNode={handleInsertNode}
            onAddBranch={handleAddBranch}
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
      </Paper>
      <Toast
        severity="warning"
        message={toastMsg}
        open={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
};

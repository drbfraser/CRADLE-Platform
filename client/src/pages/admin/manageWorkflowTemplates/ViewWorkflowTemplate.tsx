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
  TemplateStepWithFormAndIndex,
  WorkflowTemplate,
} from 'src/shared/types/workflow/workflowTypes';
import { getTemplateWithStepsAndClassification } from 'src/shared/api/modules/workflowTemplates';
import { WorkflowMetadata } from '../../../shared/components/workflow/workflowTemplate/WorkflowMetadata';
import { WorkflowSteps } from 'src/shared/components/workflow/WorkflowSteps';
import { WorkflowFlowView } from 'src/shared/components/workflow/workflowTemplate/viewFlow/WorkflowFlowView';
import { useEditWorkflowTemplate } from './mutations';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

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

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'flow'>('flow');

  // Fetch the workflow template data to ensure it's always up-to-date
  const workflowTemplateQuery = useQuery({
    queryKey: ['workflowTemplate', viewWorkflow?.id],
    queryFn: async (): Promise<WorkflowTemplate> => {
      if (!viewWorkflow?.id)
        throw new Error('No workflow template ID provided');
      return await getTemplateWithStepsAndClassification(viewWorkflow.id);
    },
    enabled: !!viewWorkflow?.id,
    initialData: viewWorkflow,
  });

  console.log('workflowTemplateQuery.data', workflowTemplateQuery.data);

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

    try {
      await editWorkflowTemplateMutation.mutateAsync(editedWorkflow);
      setIsEditMode(false);
      setEditedWorkflow(null);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving workflow template:', error);
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
              variant={viewMode === 'flow' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('flow')}
              disabled={isEditMode}>
              Flow View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('list')}
              disabled={isEditMode}>
              List View
            </Button>
          </Stack>
        </Box>

        {isLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : viewMode === 'flow' ? (
          <WorkflowFlowView
            steps={
              workflowTemplateQuery.data
                ?.steps as TemplateStepWithFormAndIndex[]
            }
            firstStepId={currentWorkflow?.startingStepId || ''}
            isInstance={false}
          />
        ) : (
          <WorkflowSteps
            steps={
              workflowTemplateQuery.data
                ?.steps as TemplateStepWithFormAndIndex[]
            }
            firstStep={currentWorkflow?.startingStepId}
            isInstance={false}
          />
        )}
      </Paper>
    </>
  );
};

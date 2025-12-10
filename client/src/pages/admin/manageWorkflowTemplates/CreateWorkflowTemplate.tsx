import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useEffect, useState } from 'react';
import {
  WorkflowTemplate,
  TemplateInput,
} from 'src/shared/types/workflow/workflowApiTypes';
import { WorkflowEditor } from 'src/shared/components/workflow/workflowTemplate/WorkflowEditor';
import { useWorkflowEditor } from 'src/shared/hooks/workflowTemplate/useWorkflowEditor';
import { useCreateWorkflowTemplate } from './mutations';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';

// Create an empty workflow template for new template creation
const createEmptyTemplate = (): WorkflowTemplate => {
  const now = Date.now();
  const defaultStepId = `step-${now}`;

  return {
    id: '',
    name: '',
    description: '',
    version: 'V1',
    classificationId: '',
    steps: [
      {
        id: defaultStepId,
        name: 'Step 1',
        description: 'This is the Starting step',
        lastEdited: now,
        branches: [],
      },
    ],
    startingStepId: defaultStepId,
    archived: false,
    dateCreated: now,
    lastEdited: now,
    lastEditedBy: '',
  };
};

export const CreateWorkflowTemplate = () => {
  const navigate = useNavigate();

  // Create an empty template for initialization
  const [emptyTemplate] = useState<WorkflowTemplate>(createEmptyTemplate);

  const createWorkflowTemplateMutation = useCreateWorkflowTemplate();

  const workflowEditor = useWorkflowEditor({
    initialWorkflow: emptyTemplate,
    enabled: true,
    onSave: async (workflow) => {
      // Validate required fields
      if (!workflow.name?.trim()) {
        workflowEditor.setToastMsg('Please enter a workflow name');
        workflowEditor.setToastOpen(true);
        throw new Error('Name is required');
      }

      if (!workflow.version?.trim()) {
        workflowEditor.setToastMsg('Please enter a version');
        workflowEditor.setToastOpen(true);
        throw new Error('Version is required');
      }

      // Generate a temporary template ID for the steps
      const tempTemplateId = workflow.id || `temp-${Date.now()}`;

      const payload = {
        name: workflow.name,
        description: workflow.description || '',
        version: workflow.version,
        archived: false,
        classification: workflow.classification || null,
        steps: workflow.steps.map((step) => ({
          id: step.id,
          name: step.name,
          description: step.description,
          workflowTemplateId: step.workflowTemplateId || tempTemplateId,
          branches: step.branches || [],
          lastEdited: step.lastEdited,
          formId: step.formId,
          expectedCompletion: step.expectedCompletion,
        })),
        startingStepId: workflow.startingStepId,
        // Only include classificationId if it has a value
        ...(workflow.classificationId && {
          classificationId: workflow.classificationId,
        }),
      } as TemplateInput;

      await createWorkflowTemplateMutation.mutateAsync(payload);

      // Redirect to workflow templates page after successful creation
      navigate('/admin/workflow-templates');
    },
    onCancel: () => navigate('/admin/workflow-templates'),
  });

  // Initialize editor on mount
  useEffect(() => {
    if (!workflowEditor.editedWorkflow) {
      workflowEditor.initializeEditor(emptyTemplate);
    }
  }, [emptyTemplate]);

  return (
    <>
      {createWorkflowTemplateMutation.isError && <APIErrorToast />}

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
                onClick={() => navigate('/admin/workflow-templates')}
                size="medium">
                <ChevronLeftIcon color="inherit" fontSize="large" />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" component="h2" sx={{ ml: 0.5 }}>
              Create New Workflow Template
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <WorkflowEditor
          workflow={workflowEditor.editedWorkflow}
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
          onSave={workflowEditor.handleSave}
          onCancel={workflowEditor.handleCancel}
          canUndo={workflowEditor.canUndo}
          canRedo={workflowEditor.canRedo}
          onUndo={workflowEditor.undo}
          onRedo={workflowEditor.redo}
          isSaving={createWorkflowTemplateMutation.isPending}
        />
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

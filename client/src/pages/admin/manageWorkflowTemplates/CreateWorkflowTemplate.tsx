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
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import { TemplateMultiLangInput } from 'src/shared/types/workflow/workflowMultiLangTypes';
import { WorkflowEditor } from 'src/shared/components/workflow/workflowTemplate/WorkflowEditor';
import { useWorkflowEditor } from 'src/shared/hooks/workflowTemplate/useWorkflowEditor';
import {
  hasEnglishText,
  pruneToLanguages,
  getPrunedStepTranslations,
} from 'src/shared/hooks/workflowTemplate/useWorkflowLanguages';
import { getDefaultLanguage } from 'src/shared/utils/format';
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
        description: '',
        lastEdited: now,
        branches: [],
      },
    ],
    startingStepId: defaultStepId,
    archived: false,
    hasBranchingIssues: false,
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
      const { languages, translations } = workflowEditor;

      if (workflowEditor.missingRequiredTranslations().length > 0) {
        workflowEditor.setToastMsg(
          'Please fill in the required fields for every selected language'
        );
        workflowEditor.setToastOpen(true);
        throw new Error('Missing required translations');
      }

      const prunedClassificationName = pruneToLanguages(
        translations.classificationName,
        languages
      );

      if (!hasEnglishText(prunedClassificationName)) {
        workflowEditor.setToastMsg('An English template name is required');
        workflowEditor.setToastOpen(true);
        throw new Error('English name required');
      }

      // Generate a temporary template ID for the steps (server rewrites this)
      const tempTemplateId = workflow.id || `temp-${Date.now()}`;
      const classificationId =
        workflow.classificationId ||
        workflow.classification?.id ||
        `wc-${Date.now()}`;

      const payload = {
        description: pruneToLanguages(
          translations.templateDescription,
          languages
        ),
        archived: false,
        classification_id: classificationId,
        classification: {
          id: classificationId,
          name: prunedClassificationName,
        },
        steps: (workflow.steps || []).map((step) => {
          const { name, description } = getPrunedStepTranslations(
            translations,
            step.id,
            languages
          );
          return {
            id: step.id,
            name,
            description,
            workflow_template_id: step.workflowTemplateId || tempTemplateId,
            branches: (step.branches || []).map((branch) => ({
              id: branch.id,
              step_id: branch.stepId,
              condition_id: branch.conditionId,
              condition: branch.condition,
              target_step_id: branch.targetStepId,
            })),
            last_edited: step.lastEdited,
            form_id: step.formId,
            expected_completion: step.expectedCompletion,
          };
        }),
        starting_step_id:
          workflow.steps?.length && workflow.startingStepId
            ? workflow.startingStepId
            : null,
      } as unknown as TemplateMultiLangInput;

      await createWorkflowTemplateMutation.mutateAsync(payload);

      // Redirect to workflow templates page after successful creation
      navigate('/admin/workflow-templates');
    },
    onCancel: () => navigate('/admin/workflow-templates'),
  });

  // Initialize editor on mount. Note: editedWorkflow is already populated at
  // this point (useWorkflowEditorState seeds it straight from initialWorkflow
  // since `enabled` is always true here), so this can't be gated on
  // `!workflowEditor.editedWorkflow` the way ViewWorkflowTemplate's edit-mode
  // effect is - that guard would never fire, and the languages bag would never
  // get seeded. `emptyTemplate` is referentially stable (built once via the
  // lazy useState initializer above), so this still only runs once on mount.
  useEffect(() => {
    workflowEditor.initializeEditor(emptyTemplate);
    workflowEditor.initializeCreateLanguages([
      getDefaultLanguage() ?? 'English',
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emptyTemplate]);

  return (
    <>
      {createWorkflowTemplateMutation.isError && (
        <APIErrorToast
          errorMessage={createWorkflowTemplateMutation.error.message}
        />
      )}

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
          editor={workflowEditor}
          allowClassificationEdit={true}
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

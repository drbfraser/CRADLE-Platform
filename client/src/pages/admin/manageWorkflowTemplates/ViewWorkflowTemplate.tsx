import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, Divider, Alert, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import { WorkflowTemplateMultiLang } from 'src/shared/types/workflow/workflowMultiLangTypes';
import { WorkflowViewMode } from 'src/shared/types/workflow/workflowEnums';
import {
  getTemplateWithStepsAndClassification,
  getTemplateTranslations,
  getTemplateLangs,
} from 'src/shared/api/modules/workflowTemplates';
import { WorkflowEditor } from 'src/shared/components/workflow/workflowTemplate/WorkflowEditor';
import { LanguageAutocomplete } from 'src/shared/components/workflow/workflowTemplate/LanguageAutocomplete';
import { useWorkflowEditor } from 'src/shared/hooks/workflowTemplate/useWorkflowEditor';
import {
  hasEnglishText,
  pruneToLanguages,
  getPrunedStepTranslations,
} from 'src/shared/hooks/workflowTemplate/useWorkflowLanguages';
import { useEditWorkflowTemplate } from './mutations';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';
import ArchiveTemplateDialog from './ArchiveTemplateDialog';
import UnarchiveTemplateDialog from './UnarchiveTemplateDialog';
import { WorkflowTemplatePageHeader, dash } from './WorkflowTemplatePageHeader';
import { WorkflowTemplateViewContent } from './WorkflowTemplateViewContent';

export const ViewWorkflowTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewWorkflow = location.state?.viewWorkflow;

  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<WorkflowViewMode>(
    WorkflowViewMode.FLOW
  );
  const [isArchivePopupOpen, setIsArchivePopupOpen] = useState(false);
  const [isUnarchivePopupOpen, setIsUnarchivePopupOpen] = useState(false);
  const [viewLanguage, setViewLanguage] = useState<string>('');

  const templateLangsQuery = useQuery({
    queryKey: ['workflowTemplateLangs', viewWorkflow?.id],
    queryFn: () => getTemplateLangs(viewWorkflow.id),
    enabled: !!viewWorkflow?.id,
  });
  const viewLanguages = templateLangsQuery.data ?? [];

  const effectiveViewLanguage =
    viewLanguage ||
    (viewLanguages.includes('English') ? 'English' : viewLanguages[0]);

  const workflowTemplateQuery = useQuery({
    queryKey: ['workflowTemplate', viewWorkflow?.id, effectiveViewLanguage],
    queryFn: async (): Promise<WorkflowTemplate> => {
      if (!viewWorkflow?.id)
        throw new Error('No workflow template ID provided');
      return getTemplateWithStepsAndClassification(
        viewWorkflow.id,
        effectiveViewLanguage
      );
    },
    enabled: !!viewWorkflow?.id,
    initialData: effectiveViewLanguage ? undefined : viewWorkflow,
  });

  // Raw multi-language shape, fetched only when entering edit mode - the
  // resolved single-language workflowTemplateQuery above would silently drop
  // every non-English translation if it were used to seed the editor instead.
  const translationsQuery = useQuery({
    queryKey: ['workflowTemplateTranslations', viewWorkflow?.id],
    queryFn: (): Promise<WorkflowTemplateMultiLang> =>
      getTemplateTranslations(viewWorkflow.id),
    enabled: !!viewWorkflow?.id && isEditMode,
  });

  const editWorkflowTemplateMutation = useEditWorkflowTemplate();

  const workflowEditor = useWorkflowEditor({
    initialWorkflow: workflowTemplateQuery.data || null,
    enabled: isEditMode,
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

      const payload = {
        description: pruneToLanguages(
          translations.templateDescription,
          languages
        ),
        archived: workflow.archived,
        startingStepId: workflow.startingStepId,
        classificationId: workflow.classificationId,
        classification: {
          id: workflow.classification?.id,
          name: prunedClassificationName,
        },
        steps: (workflow.steps || []).map((step) => {
          const { name, description } = getPrunedStepTranslations(
            translations,
            step.id,
            languages
          );
          return {
            ...step,
            name,
            description,
          };
        }),
      };

      await editWorkflowTemplateMutation.mutateAsync({
        templateId: workflow.id,
        payload,
      });
      navigate('/admin/workflow-templates');
    },
    onCancel: () => setIsEditMode(false),
  });

  useEffect(() => {
    if (
      isEditMode &&
      translationsQuery.data &&
      !workflowEditor.editedWorkflow
    ) {
      const availableLanguages = Object.keys(
        translationsQuery.data.classification?.name ?? {}
      );
      workflowEditor.initializeEditorWithLanguages(
        translationsQuery.data,
        availableLanguages
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, translationsQuery.data]);

  const currentWorkflow = isEditMode
    ? workflowEditor.editedWorkflow
    : workflowTemplateQuery.data;
  const classificationName =
    currentWorkflow?.classification?.name || currentWorkflow?.name;

  return (
    <>
      {(workflowTemplateQuery.isError ||
        translationsQuery.isError ||
        templateLangsQuery.isError ||
        editWorkflowTemplateMutation.isError) && (
        <APIErrorToast
          errorMessage={
            editWorkflowTemplateMutation.isError
              ? editWorkflowTemplateMutation.error.message
              : undefined
          }
        />
      )}

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <WorkflowTemplatePageHeader
          title={`Workflow Classification: ${dash(classificationName)}`}
          onBack={() => navigate('/admin/workflow-templates')}
          workflow={workflowTemplateQuery.data}
          isEditMode={isEditMode}
          onEdit={() => setIsEditMode(true)}
          onArchive={() => setIsArchivePopupOpen(true)}
          onUnarchive={() => setIsUnarchivePopupOpen(true)}
        />

        {!isEditMode && viewLanguages.length > 1 && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <LanguageAutocomplete
              options={viewLanguages}
              value={effectiveViewLanguage}
              onChange={setViewLanguage}
              sx={{ maxWidth: 260 }}
            />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {workflowTemplateQuery.data?.hasBranchingIssues &&
          (!isEditMode || !workflowEditor.hasChanges) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <strong>Branching issue detected.</strong> A form used by this
              workflow was updated in a way that breaks one or more branch
              conditions. Open the affected step(s) and fix or remove the broken
              conditions, then save to re-evaluate.
            </Alert>
          )}

        {isEditMode ? (
          <WorkflowEditor
            editor={workflowEditor}
            allowClassificationEdit={true}
            isSaving={editWorkflowTemplateMutation.isPending}
            hasBranchingIssues={
              !!workflowTemplateQuery.data?.hasBranchingIssues
            }
          />
        ) : (
          <WorkflowTemplateViewContent
            workflow={currentWorkflow}
            isLoading={workflowTemplateQuery.isPending}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            classificationName={classificationName}
          />
        )}
      </Paper>

      <ArchiveTemplateDialog
        open={isArchivePopupOpen}
        onClose={() => setIsArchivePopupOpen(false)}
        template={workflowTemplateQuery.data}
        onArchived={() => navigate('/admin/workflow-templates')}
      />
      <UnarchiveTemplateDialog
        open={isUnarchivePopupOpen}
        onClose={() => setIsUnarchivePopupOpen(false)}
        template={workflowTemplateQuery.data}
      />
      <Toast
        severity="warning"
        message={workflowEditor.toastMsg}
        open={workflowEditor.toastOpen}
        onClose={() => workflowEditor.setToastOpen(false)}
      />
    </>
  );
};

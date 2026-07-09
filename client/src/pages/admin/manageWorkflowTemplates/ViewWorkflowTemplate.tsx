import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import { WorkflowViewMode } from 'src/shared/types/workflow/workflowEnums';
import { getTemplateWithStepsAndClassification } from 'src/shared/api/modules/workflowTemplates';
import { WorkflowEditor } from 'src/shared/components/workflow/workflowTemplate/WorkflowEditor';
import { useWorkflowEditor } from 'src/shared/hooks/workflowTemplate/useWorkflowEditor';
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

  const workflowTemplateQuery = useQuery({
    queryKey: ['workflowTemplate', viewWorkflow?.id],
    queryFn: async (): Promise<WorkflowTemplate> => {
      if (!viewWorkflow?.id)
        throw new Error('No workflow template ID provided');
      return getTemplateWithStepsAndClassification(viewWorkflow.id);
    },
    enabled: !!viewWorkflow?.id,
    initialData: viewWorkflow,
  });

  const editWorkflowTemplateMutation = useEditWorkflowTemplate();

  const workflowEditor = useWorkflowEditor({
    initialWorkflow: workflowTemplateQuery.data || null,
    enabled: isEditMode,
    onSave: async (workflow) => {
      await editWorkflowTemplateMutation.mutateAsync({ template: workflow });
      navigate('/admin/workflow-templates');
    },
    onCancel: () => setIsEditMode(false),
  });

  useEffect(() => {
    if (
      isEditMode &&
      workflowTemplateQuery.data &&
      !workflowEditor.editedWorkflow
    ) {
      workflowEditor.initializeEditor({ ...workflowTemplateQuery.data });
    }
  }, [isEditMode, workflowTemplateQuery.data]);

  const currentWorkflow = isEditMode
    ? workflowEditor.editedWorkflow
    : workflowTemplateQuery.data;
  const classificationName =
    currentWorkflow?.classification?.name || currentWorkflow?.name;

  return (
    <>
      {(workflowTemplateQuery.isError ||
        editWorkflowTemplateMutation.isError) && <APIErrorToast />}

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

        <Divider sx={{ my: 3 }} />

        {isEditMode ? (
          <WorkflowEditor
            editor={workflowEditor}
            allowClassificationEdit={true}
            isSaving={editWorkflowTemplateMutation.isPending}
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

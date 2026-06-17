import { FormRenderStateEnum, SnackbarSeverity } from 'src/shared/enums';
import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import { ConfirmDialogData } from 'src/pages/patient/WorkflowInfo/components/WorkflowConfirmDialog';

type UseStepHistoryActionsParams = {
  setConfirmDialog: React.Dispatch<React.SetStateAction<ConfirmDialogData>>;
  handleOpenFormModal: (formRenderState: FormRenderStateEnum) => void;
  handleArchiveForm: () => Promise<boolean>;
  showSnackbar: (message: string, severity: SnackbarSeverity) => void;
  setCurrentStep: (stepId: string) => Promise<{ success: boolean }>;
  overrideCompletedStep: (stepId: string) => Promise<{ success: boolean }>;
};

export function useStepHistoryActions({
  setConfirmDialog,
  handleOpenFormModal,
  handleArchiveForm,
  showSnackbar,
  setCurrentStep,
  overrideCompletedStep,
}: UseStepHistoryActionsParams) {
  const handleViewForm = () => {
    handleOpenFormModal(FormRenderStateEnum.VIEW);
  };

  const handleEditForm = () => {
    handleOpenFormModal(FormRenderStateEnum.EDIT);
  };

  const handleDiscardForm = () => {
    setConfirmDialog({
      open: true,
      title: 'Discard Form',
      message:
        'Are you sure you want to discard the submitted form? This action cannot be undone.',
      onConfirm: async () => {
        const result = await handleArchiveForm();

        if (result) {
          showSnackbar(
            'Form discarded successfully!',
            SnackbarSeverity.SUCCESS
          );
        } else {
          showSnackbar(
            'Error discarding form. Please try again.',
            SnackbarSeverity.ERROR
          );
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleCompleteNow = () => {
    handleOpenFormModal(FormRenderStateEnum.FIRST_SUBMIT);
  };

  const handleMakeCurrent = (
    stepId: string,
    title: string,
    status: StepStatus
  ) => {
    const statusNote =
      status === StepStatus.COMPLETED
        ? 'Note: A new step instance will be created.'
        : '';
    setConfirmDialog({
      open: true,
      title: 'Override Current Step',
      message: `Override current step and move to ${title}? ${statusNote}`,
      onConfirm: async () => {
        if (status === StepStatus.COMPLETED) {
          const { success } = await overrideCompletedStep(stepId);
          if (!success) return;
        } else {
          const { success } = await setCurrentStep(stepId);
          if (!success) return;
        }

        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  return {
    handleViewForm,
    handleEditForm,
    handleDiscardForm,
    handleCompleteNow,
    handleMakeCurrent,
  };
}

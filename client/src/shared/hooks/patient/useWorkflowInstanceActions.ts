import { useState } from 'react';
import axios from 'axios';
import { ConfirmDialogData } from 'src/shared/types/confirmDialogTypes';
import { archiveInstanceStepForm } from 'src/shared/api';
import { SnackbarSeverity } from 'src/shared/enums';
import { useSnackbar } from 'src/shared/hooks/useSnackbar';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import {
  InstanceDetails,
  InstanceStep,
  WorkflowNextStepOption,
  WorkflowStepHistoryActions,
} from 'src/shared/types/workflow/workflowUiTypes';
import { useWorkflowFormModal } from './useWorkflowFormModal';
import { useWorkflowNextStepOptions } from './useWorkflowNextStepOptions';
import { useWorkflowStepActions } from './useWorkflowStepActions';
import { useStepHistoryActions } from './useStepHistoryActions';

type UseWorkflowInstanceActionsParams = {
  instanceDetails: InstanceDetails | null;
  template: WorkflowTemplate | null;
  currentStep: InstanceStep | null;
  reload: () => Promise<void>;
};

export function useWorkflowInstanceActions({
  instanceDetails,
  template,
  currentStep,
  reload,
}: UseWorkflowInstanceActionsParams) {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const { snackbar, showSnackbar, handleCloseSnackbar } = useSnackbar();

  const {
    formModalState,
    handleOpenFormModal,
    handleCloseFormModal,
    onRefetchForm,
  } = useWorkflowFormModal(currentStep, reload);

  const {
    nextOptions,
    currentStepEvaluation,
    openNextStepModal,
    handleOpenNextStepModal,
    handleCloseNextStepModal,
  } = useWorkflowNextStepOptions(
    instanceDetails,
    template,
    currentStep,
    showSnackbar
  );

  const {
    completeAndStartNextStep,
    completeFinalStep,
    setCurrentStep,
    overrideCompletedStep,
  } = useWorkflowStepActions(
    instanceDetails,
    currentStep,
    currentStepEvaluation,
    showSnackbar,
    reload
  );

  const handleArchiveForm = async () => {
    try {
      if (!currentStep) {
        console.error('Error deleting form (no current step)');
        return false;
      }

      if (!currentStep.formId) {
        console.error('No form associated with current step');
        return false;
      }

      await archiveInstanceStepForm(currentStep.id);
      reload();
      setConfirmDialog((prev) => ({ ...prev, open: false }));
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error deleting form for current step:',
          error.response?.status,
          error.message
        );
      } else {
        console.log('Unknown error deleting form:', error);
      }
      return false;
    }
  };

  const {
    handleViewForm,
    handleEditForm,
    handleDiscardForm,
    handleCompleteNow,
    handleMakeCurrent,
  } = useStepHistoryActions({
    setConfirmDialog,
    handleOpenFormModal,
    handleArchiveForm,
    showSnackbar,
    setCurrentStep,
    overrideCompletedStep,
  });

  const workflowStepHistoryActions: WorkflowStepHistoryActions = {
    form: {
      modalState: formModalState,
      onClose: handleCloseFormModal,
      onRefetch: onRefetchForm,
    },
    formActions: {
      onView: handleViewForm,
      onEdit: handleEditForm,
      onDiscard: handleDiscardForm,
      onCompleteNow: handleCompleteNow,
    },
    stepActions: {
      onCompleteStep: handleOpenNextStepModal,
      onMakeCurrent: handleMakeCurrent,
    },
  };

  const handleCompleteFinalStep = async () => {
    const { success } = await completeFinalStep();
    if (!success) return;
    handleCloseNextStepModal();
  };

  const handleCompleteAndStartNextStep = async (
    option: WorkflowNextStepOption
  ) => {
    try {
      const result = await completeAndStartNextStep(option);
      if (!result.success) return undefined;

      handleCloseNextStepModal();
      showSnackbar('Step completed!', SnackbarSeverity.SUCCESS);
      return result.nextInstanceStepId;
    } catch (e) {
      console.error('Unable to complete step', e);
      showSnackbar('Unable to complete step', SnackbarSeverity.ERROR);
      return undefined;
    }
  };

  return {
    confirmDialog,
    setConfirmDialog,
    snackbar,
    showSnackbar,
    handleCloseSnackbar,
    workflowStepHistoryActions,
    nextOptions,
    openNextStepModal,
    handleCloseNextStepModal,
    handleCompleteFinalStep,
    handleCompleteAndStartNextStep,
    handleMakeCurrent,
  };
}

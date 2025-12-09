import {
  advanceOverrideStep,
  advanceRecommendedStep,
  applyInstanceStepAction,
} from 'src/shared/api';
import { SnackbarSeverity } from 'src/shared/enums';
import {
  ApplyInstanceStepActionRequest,
  WorkflowInstanceStepEvaluation,
} from 'src/shared/types/workflow/workflowApiTypes';
import { InstanceStepAction } from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceDetails,
  InstanceStep,
} from 'src/shared/types/workflow/workflowUiTypes';

export function useWorkflowStepActions(
  instanceDetails: InstanceDetails | null,
  currentStep: InstanceStep | null,
  currentStepEvaluation: WorkflowInstanceStepEvaluation | null,
  showSnackbar: (message: string, severity: SnackbarSeverity) => void,
  reload: () => Promise<void>
) {
  const handleApplyStepAction = async (
    actionType: InstanceStepAction,
    stepId: string
  ) => {
    const payload: ApplyInstanceStepActionRequest = {
      action: {
        type: actionType,
        step_id: stepId,
      },
    };
    const response = await applyInstanceStepAction(
      instanceDetails!.id,
      payload
    );

    return response;
  };

  const startStep = async (stepId: string) => {
    return await handleApplyStepAction(InstanceStepAction.START, stepId);
  };

  const completeStep = async () => {
    return await handleApplyStepAction(
      InstanceStepAction.COMPLETE,
      currentStep!.id
    );
  };

  const isRecommendedStep = (stepId: string) => {
    return currentStepEvaluation!.selectedBranchId === stepId;
  };

  const advanceInstanceCurrentStep = async (stepId: string) => {
    if (isRecommendedStep(stepId)) {
      await advanceRecommendedStep(instanceDetails!.id);
    } else {
      await advanceOverrideStep(instanceDetails!.id, {
        workflowInstanceStepId: stepId,
      });
    }
  };

  const completeWorkflow = async () => {
    return await handleApplyStepAction(
      InstanceStepAction.COMPLETE_WORKFLOW,
      currentStep!.id
    );
  };

  const completeFinalStep = async () => {
    try {
      await completeStep();
      await reload();

      await completeWorkflow();
      await reload();

      showSnackbar('Workflow completed!', SnackbarSeverity.SUCCESS);
      return { success: true };
    } catch (e) {
      console.error('Unable to complete step', e);
      showSnackbar('Unable to complete step', SnackbarSeverity.ERROR);
      return { success: false };
    }
  };

  const completeAndStartNextStep = async (stepId: string) => {
    try {
      await completeStep();
      await reload();

      await advanceInstanceCurrentStep(stepId);

      await startStep(stepId);
      await reload();

      showSnackbar('Step completed!', SnackbarSeverity.SUCCESS);
      return { success: true };
    } catch (e) {
      console.error('Unable to complete step', e);
      showSnackbar('Unable to complete step', SnackbarSeverity.ERROR);
      return { success: false };
    }
  };

  return {
    completeFinalStep,
    completeAndStartNextStep,
  };
}

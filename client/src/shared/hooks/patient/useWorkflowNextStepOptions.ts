import { useState } from 'react';
import { getWorkflowNextStepOptions } from 'src/pages/patient/WorkflowInfo/WorkflowUtils';
import { evaluateInstanceStep } from 'src/shared/api';
import { SnackbarSeverity } from 'src/shared/enums';
import {
  WorkflowInstanceStepEvaluation,
  WorkflowTemplate,
} from 'src/shared/types/workflow/workflowApiTypes';
import {
  InstanceDetails,
  InstanceStep,
  WorkflowNextStepOption,
} from 'src/shared/types/workflow/workflowUiTypes';

export function useWorkflowNextStepOptions(
  instanceDetails: InstanceDetails | null,
  template: WorkflowTemplate | null,
  currentStep: InstanceStep | null,
  showSnackbar: (message: string, severity: SnackbarSeverity) => void
) {
  const [nextOptions, setNextOptions] = useState<WorkflowNextStepOption[]>([]);
  const [currentStepEvaluation, setCurrentStepEvaluation] =
    useState<WorkflowInstanceStepEvaluation | null>(null);
  const [openNextStepModal, setOpenNextStepModal] = useState<boolean>(false);

  const getNextStepOptions = async () => {
    if (!instanceDetails || !template || !currentStep) return;

    const currentStepEval = await evaluateInstanceStep(
      instanceDetails.id,
      currentStep.id
    );
    setCurrentStepEvaluation(currentStepEval);

    return getWorkflowNextStepOptions(
      instanceDetails,
      template,
      currentStepEval,
      currentStep.id
    );
  };

  const handleOpenNextStepModal = async () => {
    try {
      const options = await getNextStepOptions();
      if (!options) return;

      setNextOptions(options);
      setOpenNextStepModal(true);
    } catch (e) {
      console.error('Unable to get next steps', e);
      showSnackbar('Unable to get next steps', SnackbarSeverity.ERROR);
    }
  };

  const handleCloseNextStepModal = () => {
    setOpenNextStepModal(false);
  };

  return {
    nextOptions,
    currentStepEvaluation,
    openNextStepModal,
    handleOpenNextStepModal,
    handleCloseNextStepModal,
  };
}

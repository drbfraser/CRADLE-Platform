import { useCallback, useEffect, useState } from 'react';
import {
  buildInstanceDetails,
  computeProgressAndEta,
  getWorkflowCurrentStep,
} from 'src/pages/patient/WorkflowInfo/utils';
import {
  getInstanceWithSteps,
  getPatientInfoAsync,
  getTemplateWithStepsAndClassification,
} from 'src/shared/api';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import {
  InstanceDetails,
  InstanceStep,
  WorkflowInstanceProgress,
} from 'src/shared/types/workflow/workflowUiTypes';

export function useWorkflowInstanceDetails(instanceId: string | undefined) {
  const [instanceDetails, setInstanceDetails] =
    useState<InstanceDetails | null>(null);
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState<InstanceStep | null>(null);
  const [progressInfo, setProgressInfo] = useState<WorkflowInstanceProgress>({
    total: 0,
    completed: 0,
    percent: 0,
    estDaysRemaining: 0,
    currentIndex: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!instanceId) {
      setIsLoading(false);
      setError('No workflow instance ID provided');
      setInstanceDetails(null);
      setTemplate(null);
      setCurrentStep(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const instance = await getInstanceWithSteps(instanceId);
      const patient = await getPatientInfoAsync(instance.patientId);
      const template = await getTemplateWithStepsAndClassification(
        instance.workflowTemplateId
      );
      setTemplate(template);

      const details = buildInstanceDetails(instance, template, patient);
      setInstanceDetails(details);

      const activeStep = getWorkflowCurrentStep(details);
      setCurrentStep(activeStep ?? null);

      const progress = computeProgressAndEta(details.steps);
      setProgressInfo(progress);
    } catch (err) {
      let message = 'Failed to load workflow instance details';
      if (err && typeof err === 'object' && 'message' in err) {
        message = String((err as { message: unknown }).message);
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      setInstanceDetails(null);
      setTemplate(null);
      setCurrentStep(null);
    } finally {
      setIsLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    instanceDetails,
    template,
    currentStep,
    progressInfo,
    isLoading,
    error,
    reload: fetchAll,
  };
}

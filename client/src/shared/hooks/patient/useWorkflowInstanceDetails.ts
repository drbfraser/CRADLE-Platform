import { set } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import {
  buildInstanceDetails,
  computeProgressAndEta,
  getWorkflowCurrentStep,
} from 'src/pages/patient/WorkflowInfo/WorkflowUtils';
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

export function useWorkflowInstanceDetails(instanceId: string) {
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

  const fetchAll = useCallback(async () => {
    try {
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
      console.error('Failed to load workflow instance details', err);
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
    reload: fetchAll,
  };
}

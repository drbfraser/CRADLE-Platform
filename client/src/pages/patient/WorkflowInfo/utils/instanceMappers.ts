import { getTemplate } from 'src/shared/api';
import { Patient } from 'src/shared/types/patientTypes';
import {
  WorkflowInstance,
  WorkflowInstanceStep,
  WorkflowInstanceStepEvaluation,
  WorkflowTemplate,
  WorkflowTemplateStep,
} from 'src/shared/types/workflow/workflowApiTypes';
import {
  InstanceStatus,
  StepStatus,
} from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceDetails,
  InstanceStep,
  WorkflowInfoRow,
  WorkflowNextStepOption,
} from 'src/shared/types/workflow/workflowUiTypes';
import {
  formatISODateNumber,
  formatISODateNumberWithTime,
} from 'src/shared/utils';
import {
  getWorkflowStepHistory,
  initiateWorkflowPossibleSteps,
} from './stepTree';

export function findTemplateStepById(
  templateStepId: string,
  template: WorkflowTemplate
) {
  return template.steps?.find((step) => step.id === templateStepId);
}

export function mapWorkflowStep(
  apiStep: WorkflowInstanceStep,
  template: WorkflowTemplate
): InstanceStep {
  const templateStep: WorkflowTemplateStep | undefined = findTemplateStepById(
    apiStep.workflowTemplateStepId,
    template
  );

  if (!templateStep) {
    throw new Error(
      `No template step found for id ${apiStep.workflowTemplateStepId}`
    );
  }

  const workflowInstanceStep: InstanceStep = {
    id: apiStep.id,
    title: apiStep.name,
    status: apiStep.status,
    startedOn: formatISODateNumberWithTime(apiStep.startDate),
    completedOn: apiStep.completionDate
      ? formatISODateNumberWithTime(apiStep.completionDate)
      : null,
    description: apiStep.description,
    expectedCompletion: apiStep.expectedCompletion
      ? formatISODateNumber(apiStep.expectedCompletion)
      : null,
    // nextStep?: string;  // TODO: Not implemented in backend yet
    formSubmitted: apiStep.formId ? true : false,
    workflowTemplateStepId: apiStep.workflowTemplateStepId,
  };

  if (templateStep.formId)
    workflowInstanceStep.formTemplateId = templateStep.formId;

  if (apiStep.formId) workflowInstanceStep.formId = apiStep.formId;
  if (apiStep.form) workflowInstanceStep.form = apiStep.form;

  return workflowInstanceStep;
}

export function buildInstanceDetails(
  instance: WorkflowInstance,
  template: WorkflowTemplate,
  patient: Patient
): InstanceDetails {
  const steps = instance.steps.map((step) => mapWorkflowStep(step, template));

  const instanceDetails: InstanceDetails = {
    id: instance.id,
    studyTitle: instance.name,
    status: instance.status,
    patientName: patient.name,
    patientId: instance.patientId,
    description: instance.description,
    collection: 'PAPAGO', // TODO - To do when collections set up
    version: template.version,
    firstCreatedOn: formatISODateNumber(template.dateCreated),
    lastEditedOn: formatISODateNumber(instance.lastEdited),
    lastEditedBy: instance.lastEditedBy,
    workflowStartedOn: formatISODateNumber(instance.startDate),
    workflowStartedBy: 'N/A', // TODO - add to backend? currently not in DB
    workflowCompletedOn: instance.completionDate
      ? formatISODateNumber(instance.completionDate)
      : null,

    currentStepId: instance.currentStepId,
    steps,
    stepHistory: [],
    possibleSteps: initiateWorkflowPossibleSteps(steps, template),
  };

  instanceDetails.stepHistory = getWorkflowStepHistory(instanceDetails);

  return instanceDetails;
}

export function getWorkflowStepWithId(
  stepId: string,
  instanceDetails: InstanceDetails
): InstanceStep | null {
  const step = instanceDetails.steps.find((step) => step.id === stepId);
  return step ?? null;
}

const WORKFLOW_STATUS_SORT_ORDER: Record<InstanceStatus, number> = {
  [InstanceStatus.ACTIVE]: 0,
  [InstanceStatus.COMPLETED]: 1,
  [InstanceStatus.CANCELLED]: 2,
};

export function sortWorkflowInfoRows(
  rows: WorkflowInfoRow[]
): WorkflowInfoRow[] {
  return [...rows].sort((a, b) => {
    const statusDiff =
      WORKFLOW_STATUS_SORT_ORDER[a.status] -
      WORKFLOW_STATUS_SORT_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return b.lastEdited - a.lastEdited;
  });
}

export const buildWorkflowInstanceRowList = async (
  instances: WorkflowInstance[]
) => {
  const workflowInfoRows = await Promise.all(
    instances.map(async (instance) => {
      const currentStep = instance.steps.find(
        (step) => step.status === StepStatus.ACTIVE
      );
      let templateName = 'Unknown template';

      if (instance.workflowTemplateId) {
        try {
          const template = await getTemplate(instance.workflowTemplateId);
          templateName =
            template.classification?.name || template.name || 'N/A';
        } catch {
          templateName = 'Unknown template';
        }
      }

      const workflowInfoRow: WorkflowInfoRow = {
        id: instance.id,
        instanceTitle: instance.name,
        templateId: instance.workflowTemplateId || '',
        templateName,
        description: instance.description || '',
        collection: 'PAPAGAO', // TODO - To do when collections set up
        status: instance.status,
        lastEdited: instance.lastEdited,
        stepsCount: instance.steps.length,
        currentStepLabel: currentStep ? currentStep.name : 'N/A',
      };
      return workflowInfoRow;
    })
  );
  return sortWorkflowInfoRows(workflowInfoRows);
};

export const getWorkflowNextStepOptions = (
  instance: InstanceDetails,
  template: WorkflowTemplate,
  stepEval: WorkflowInstanceStepEvaluation,
  currentStepId: string
) => {
  const branchEvals = stepEval.branchEvaluations;
  const selectedBranchId = stepEval.selectedBranchId;
  const nextOptions: WorkflowNextStepOption[] = [];

  const currentStep = instance.steps.find((step) => step.id === currentStepId);
  if (!currentStep) return nextOptions;

  const currentTemplateStep = template.steps.find(
    (step) => step.id === currentStep.workflowTemplateStepId
  );
  if (!currentTemplateStep) return nextOptions;

  branchEvals.forEach((branchEval) => {
    const branch = currentTemplateStep.branches?.find(
      (b) => b.id === branchEval.branchId
    );
    if (!branch) return;

    const targetTemplateStep = template.steps.find(
      (step) => step.id === branch.targetStepId
    );
    if (!targetTemplateStep) return;

    const nextOption: WorkflowNextStepOption = {
      branchId: branchEval.branchId,
      templateStepId: targetTemplateStep.id,
      title: targetTemplateStep.name,
      isRecommended: selectedBranchId === branchEval.branchId,
      rule: branchEval.rule ?? 'N/A',
      ruleStatus: branchEval.ruleStatus,
      varResolutions: branchEval.varResolutions,
    };

    nextOptions.push(nextOption);
  });

  return nextOptions;
};

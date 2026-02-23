import { describe, it, expect, vi } from 'vitest';
import {
  WORKFLOW_INSTANCE_TEST_DATA,
  WORKFLOW_TEMPLATE_TEST_DATA,
} from '../testData';
import {
  formatISODateNumber,
  formatISODateNumberWithTime,
} from 'src/shared/utils';
import { getPatientInfoAsync } from 'src/shared/api';
import {
  buildInstanceDetails,
  mapWorkflowStep,
  initiateWorkflowPossibleSteps,
} from 'src/pages/patient/WorkflowInfo/WorkflowUtils';

// Mock API calls
vi.mock('src/shared/api', () => ({
  getInstanceWithSteps: vi
    .fn()
    .mockResolvedValue(WORKFLOW_INSTANCE_TEST_DATA.instances[0]),
  getTemplate: vi.fn().mockResolvedValue({
    version: 'v1',
    dateCreated: 1740607541,
  }),
  getTemplateStepById: vi
    .fn()
    .mockResolvedValue(WORKFLOW_INSTANCE_TEST_DATA.instances[0].steps[0]),

  getPatientInfoAsync: vi.fn().mockResolvedValue({ name: 'Alice' }),
}));

describe('mapWorkflowStep', () => {
  it('formats workflow instance step correctly', async () => {
    const testWorkflowInstanceStep =
      WORKFLOW_INSTANCE_TEST_DATA.instances[0].steps[0];

    const testWorkflowTemplate =
      WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0];

    const result = mapWorkflowStep(
      testWorkflowInstanceStep,
      testWorkflowTemplate
    );

    expect(result).toMatchObject({
      id: testWorkflowInstanceStep.id,
      title: testWorkflowInstanceStep.name,
      status: testWorkflowInstanceStep.status,
      startedOn: formatISODateNumberWithTime(
        testWorkflowInstanceStep.startDate
      ),
      completedOn: formatISODateNumberWithTime(
        testWorkflowInstanceStep.completionDate!
      ),
      expectedCompletion: formatISODateNumber(
        testWorkflowInstanceStep.expectedCompletion!
      ),
      description: testWorkflowInstanceStep.description,
      formId: testWorkflowInstanceStep.formId,
      formSubmitted: true,
      formTemplateId: 'simple-workflow-instance-form-1',
      workflowTemplateStepId: testWorkflowInstanceStep.workflowTemplateStepId,
    });
  });
});

describe('loadInstanceById', () => {
  it('formats instance details correctly', async () => {
    const testWorkflowInstance = WORKFLOW_INSTANCE_TEST_DATA.instances[0];
    const testWorkflowTemplate =
      WORKFLOW_TEMPLATE_TEST_DATA.unArchivedTemplates[0];
    const testPatient = await getPatientInfoAsync(
      testWorkflowInstance.patientId
    );

    const result = buildInstanceDetails(
      testWorkflowInstance,
      testWorkflowTemplate,
      testPatient
    );

    expect(result).toMatchObject({
      id: testWorkflowInstance.id,
      studyTitle: testWorkflowInstance.name,
      patientName: 'Alice',
      patientId: testWorkflowInstance.patientId,
      description: testWorkflowInstance.description,
      collection: 'PAPAGO',
      version: '1',
      firstCreatedOn: formatISODateNumber(testWorkflowInstance.startDate),
      lastEditedOn: formatISODateNumber(testWorkflowInstance.lastEdited),
      lastEditedBy: testWorkflowInstance.lastEditedBy,
      workflowStartedOn: formatISODateNumber(testWorkflowInstance.startDate),
      workflowStartedBy: 'N/A',
      workflowCompletedOn: testWorkflowInstance.completionDate
        ? formatISODateNumber(testWorkflowInstance.completionDate)
        : null,

      steps: testWorkflowInstance.steps.map((step) =>
        mapWorkflowStep(step, testWorkflowTemplate)
      ),
      possibleSteps: initiateWorkflowPossibleSteps(
        testWorkflowInstance.steps.map((step) =>
          mapWorkflowStep(step, testWorkflowTemplate)
        ),
        testWorkflowTemplate
      ),
    });
  });
});

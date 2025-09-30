import { describe, it, expect, vi } from 'vitest';
import { WORKFLOW_INSTANCE_TEST_DATA } from '../testData';
import { formatISODateNumber } from 'src/shared/utils';
import { mapWorkflowStep, loadInstanceById } from 'src/pages/patient/WorkflowInfo/WorkflowInstanceDetails'

// Mock API calls
vi.mock('src/shared/api', () => ({
  getInstanceWithSteps: vi.fn().mockResolvedValue(WORKFLOW_INSTANCE_TEST_DATA.workflowInstanceTemplate[0]),
  getTemplate: vi.fn().mockResolvedValue({
      version: 'v1',
      dateCreated: 1740607541,
    }),

  getPatientInfoAsync: vi.fn().mockResolvedValue({ name: 'Alice' }),
}));

const testInstanceId = "test-workflow-instance-1"

describe('mapWorkflowStep', () => {
  it('formats workflow instance step correctly', async () => {
    const testWorkflowInstanceStep = WORKFLOW_INSTANCE_TEST_DATA.workflowInstanceTemplate[0].steps[0]
    
    const result = mapWorkflowStep(testWorkflowInstanceStep);
    
    expect(result).toMatchObject(
      {
        id: testWorkflowInstanceStep.id,
        title: testWorkflowInstanceStep.name,
        status: testWorkflowInstanceStep.status,
        startedOn: formatISODateNumber(testWorkflowInstanceStep.startDate),
        completedOn: formatISODateNumber(testWorkflowInstanceStep.completionDate),
        description: testWorkflowInstanceStep.description,
        formId: testWorkflowInstanceStep.formId,
        hasForm: testWorkflowInstanceStep.formId ? true : false,
        expectedCompletion: formatISODateNumber(testWorkflowInstanceStep.expectedCompletion)
      }
    );
  });
});

describe('loadInstanceById', () => {
  it('formats instance details correctly', async () => {
    const result = await loadInstanceById(testInstanceId);
    const testWorkflowInstance = WORKFLOW_INSTANCE_TEST_DATA.workflowInstanceTemplate[0]

    expect(result).toMatchObject(
      {
        id: testWorkflowInstance.id,
        studyTitle: testWorkflowInstance.name,
        patientName: "Alice",
        patientId: testWorkflowInstance.patientId,
        description: testWorkflowInstance.description,
        collection: 'PAPAGO',
        version: 'v1',
        firstCreatedOn: formatISODateNumber(1740607541),
        lastEditedOn: formatISODateNumber(testWorkflowInstance.lastEdited),
        lastEditedBy: testWorkflowInstance.lastEditedBy,
        workflowStartedOn: formatISODateNumber(testWorkflowInstance.startDate),
        workflowStartedBy: 'N/A',
        workflowCompletedOn: testWorkflowInstance.completionDate
          ? formatISODateNumber(testWorkflowInstance.completionDate)
          : null,

        steps: testWorkflowInstance.steps.map(((step) => mapWorkflowStep(step))),
        possibleSteps: [],
      }
    );
  });
});

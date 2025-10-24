import {
  WorkflowInstance,
  WorkflowTemplate,
} from 'src/shared/types/workflow/workflowApiTypes';
import {
  InstanceStatus,
  StepStatus,
} from 'src/shared/types/workflow/workflowEnums';
import { formatISODateNumber } from 'src/shared/utils';

export const FORM_TEMPLATE_TEST_DATA = {
  unArchivedTemplates: [
    {
      archived: false,
      classification: {
        id: '2ed1cf25-34a1-48b0-b458-c8e4830159ca',
        name: 'template#1',
      },
      dateCreated: 1741373694,
      formClassificationId: '2ed1cf25-34a1-48b0-b458-c8e4830159ca',
      id: '92a98f0b-3ac7-4684-99ac-13fe1a048373',
      version: '2025-03-07 18:51:51 UTC',
    },
    {
      archived: false,
      classification: {
        id: 'dc9',
        name: 'Personal Intake Form',
      },
      dateCreated: 1740607541,
      formClassificationId: 'dc9',
      id: 'dt9',
      version: 'V1',
    },
  ],
  archivedTemplates: [
    {
      archived: true,
      classification: {
        id: '000',
        name: 'Archived Form',
      },
      dateCreated: 1740607541,
      formClassificationId: '000',
      id: '111',
      version: 'V3',
    },
  ],
} as const;

export const WORKFLOW_TEMPLATE_TEST_DATA: {
  unArchivedTemplates: WorkflowTemplate[];
  archivedTemplates: WorkflowTemplate[];
} = {
  unArchivedTemplates: [
    {
      id: 'workflow-template-1',
      name: 'Patient Intake Workflow',
      description: 'Standard patient intake process',
      version: '1',
      classificationId: 'classification-1',
      classification: {
        id: 'classification-1',
        name: 'Patient Care',
      },
      steps: [
        {
          id: 'workflow-template-1-step-1',
          name: 'Patient Intake Workflow Step 1',
          description: 'Standard patient intake process step 1',
          formId: 'simple-workflow-instance-form-1',
          branches: [],
          lastEdited: formatISODateNumber(1741373694),
        },
        {
          id: 'workflow-template-1-step-2',
          name: 'Patient Intake Workflow Step 2',
          description: 'Standard patient intake process step 2',
          formId: 'simple-workflow-instance-form-1',
          branches: [],
          lastEdited: formatISODateNumber(1741373694),
        },
      ],
      archived: false,
      dateCreated: 1741373694,
      lastEdited: 1741373694,
      lastEditedBy: 'user-1',
    },
    {
      id: 'workflow-template-2',
      name: 'Discharge Workflow',
      description: 'Patient discharge process',
      version: '2',
      classificationId: 'classification-2',
      classification: {
        id: 'classification-2',
        name: 'Discharge Process',
      },
      steps: [],
      archived: false,
      dateCreated: 1740607541,
      lastEdited: 1740607541,
      lastEditedBy: 'user-2',
    },
  ],
  archivedTemplates: [
    {
      id: 'workflow-template-archived',
      name: 'Old Workflow',
      description: 'Deprecated workflow',
      version: '1',
      classificationId: 'classification-archived',
      classification: {
        id: 'classification-archived',
        name: 'Archived Process',
      },
      steps: [],
      archived: true,
      dateCreated: 1740607541,
      lastEdited: 1740607541,
      lastEditedBy: 'user-1',
    },
  ],
} as const;

export const WORKFLOW_INSTANCE_TEST_DATA: { instances: WorkflowInstance[] } = {
  instances: [
    {
      id: 'test-workflow-instance-1',
      name: 'Patient Intake Workflow Instance',
      description: 'Standard patient intake process',
      workflowTemplateId: 'workflow-template-1',
      patientId: '49300028162',
      startDate: 1741373694,
      status: InstanceStatus.ACTIVE,
      steps: [
        {
          id: 'simple-workflow-instance-step-1',
          name: 'Patient Name Step 1',
          description: 'Patient Name Step 1',
          startDate: 1757109312,
          formId: 'simple-workflow-instance-form-1',
          assignedTo: '3',
          expectedCompletion: 1757149312,
          completionDate: 1757144312,
          status: StepStatus.ACTIVE,
          lastEdited: 1757109312,
          workflowInstanceId: 'test-workflow-instance-1',
          workflowTemplateStepId: 'workflow-template-1-step-1',
        },
        {
          id: 'simple-workflow-instance-step-2',
          name: 'Patient Name Step 2',
          description: 'Patient Name Step 2',
          startDate: 1757109312,
          formId: 'simple-workflow-instance-form-1',
          assignedTo: '3',
          expectedCompletion: 1757149312,
          completionDate: 1757144312,
          status: StepStatus.ACTIVE,
          lastEdited: 1757109312,
          workflowInstanceId: 'test-workflow-instance-1',
          workflowTemplateStepId: 'workflow-template-1-step-2',
        },
      ],
      lastEdited: 1757109312,
      lastEditedBy: 'user1',
      completionDate: 1757149312,
      workflowTemplateStepId: 'workflow-template-1',
    },
  ],
} as const;

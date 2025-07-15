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

export const WORKFLOW_TEMPLATE_TEST_DATA = {
  unArchivedTemplates: [
    {
      id: 'workflow-template-1',
      name: 'Patient Intake Workflow',
      description: 'Standard patient intake process',
      version: 1,
      classificationId: 'classification-1',
      classification: {
        id: 'classification-1',
        name: 'Patient Care',
      },
      steps: [],
      archived: false,
      dateCreated: 1741373694,
      lastEdited: 1741373694,
      lastEditedBy: 'user-1',
    },
    {
      id: 'workflow-template-2',
      name: 'Discharge Workflow',
      description: 'Patient discharge process',
      version: 2,
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
      version: 1,
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

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

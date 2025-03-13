import nock from 'nock';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EndpointEnum } from 'src/shared/enums';
import { API_URL } from 'src/shared/api/api';
import { getPrettyDate } from 'src/shared/utils';
import { createFakeAccessToken } from 'src/testing/utils';
import ProviderWrapper from 'src/testing/ProviderWrapper';
import { ManageFormTemplates } from './ManageFormTemplates';

const TEST_DATA = {
  nonArchivedForms: [
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
  archivedForms: [
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
};

describe('Form Templates Table', () => {
  beforeAll(() => {
    localStorage.setItem('accessToken', createFakeAccessToken());

    nock(API_URL)
      .persist()
      .get(EndpointEnum.FORM_TEMPLATES + '?include_archived=false')
      .reply(200, TEST_DATA.nonArchivedForms);

    nock(API_URL)
      .persist()
      .get(EndpointEnum.FORM_TEMPLATES + '?include_archived=true')
      .reply(200, TEST_DATA.archivedForms);

    nock(API_URL)
      .persist()
      .get(
        EndpointEnum.FORM_TEMPLATES +
          `/${TEST_DATA.nonArchivedForms[0].id}/versions/${TEST_DATA.nonArchivedForms[0].version}/csv`
      )
      .reply(200, new Blob(['testing']));
  });

  afterAll(() => {
    localStorage.removeItem('accessToken');
  });

  beforeEach(async () => {
    render(<ManageFormTemplates />, { wrapper: ProviderWrapper });

    // wait until the table has loaded some data
    await waitFor(() => {
      expect(
        within(screen.getByRole('rowgroup')).getAllByRole('row')
      ).toHaveLength(TEST_DATA.nonArchivedForms.length);
    });
  });

  test('Renders unarchived templates', async () => {
    const tableRows = within(screen.getByRole('rowgroup')).getAllByRole('row');

    TEST_DATA.nonArchivedForms.forEach(
      ({ classification, dateCreated, version }, index) => {
        const tableRow = tableRows[index];
        within(tableRow).getByText(classification.name);
        within(tableRow).getByText(getPrettyDate(dateCreated));
        within(tableRow).getByText(version);
      }
    );
  });

  test('Renders archived templates', async () => {
    const viewArchivedSwitch = screen.getByRole('checkbox', {
      name: 'View Archived Templates',
    });
    await userEvent.click(viewArchivedSwitch);

    let tableRows;
    await waitFor(() => {
      tableRows = within(screen.getByRole('rowgroup')).getAllByRole('row');
      expect(tableRows).toHaveLength(TEST_DATA.archivedForms.length);
    });

    TEST_DATA.archivedForms.forEach(
      ({ classification, dateCreated, version }, index) => {
        const tableRow = tableRows![index];
        within(tableRow).getByText(classification.name);
        within(tableRow).getByText(getPrettyDate(dateCreated));
        within(tableRow).getByText(version);
      }
    );
  });
});

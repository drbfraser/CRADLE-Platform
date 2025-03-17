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

import { getPrettyDate } from 'src/shared/utils';
import { createFakeAccessToken } from 'src/testing/utils';
import { FORM_TEMPLATE_TEST_DATA as TEST_DATA } from 'src/testing/testData';
import ProviderWrapper from 'src/testing/ProviderWrapper';
import { ManageFormTemplates } from './ManageFormTemplates';

describe('Form Templates Table', () => {
  beforeAll(() => {
    localStorage.setItem('accessToken', createFakeAccessToken());
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
      ).toHaveLength(TEST_DATA.unArchivedTemplates.length);
    });
  });

  test('Renders unarchived templates', async () => {
    const tableRows = within(screen.getByRole('rowgroup')).getAllByRole('row');

    TEST_DATA.unArchivedTemplates.forEach(
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
      expect(tableRows).toHaveLength(TEST_DATA.archivedTemplates.length);
    });

    TEST_DATA.archivedTemplates.forEach(
      ({ classification, dateCreated, version }, index) => {
        const tableRow = tableRows![index];
        within(tableRow).getByText(classification.name);
        within(tableRow).getByText(getPrettyDate(dateCreated));
        within(tableRow).getByText(version);
      }
    );
  });
});

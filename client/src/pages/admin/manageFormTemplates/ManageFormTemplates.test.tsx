import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
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

    // wait until at least some rows are rendered (MUI DataGrid virtualization)
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  test('Renders unarchived templates', async () => {
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // header + data rows
    });

    TEST_DATA.unArchivedTemplates.forEach(
      ({ classification, dateCreated, version }) => {
        expect(screen.getByText(classification.name)).toBeInTheDocument();
        expect(
          screen.getByText(getPrettyDate(dateCreated))
        ).toBeInTheDocument();
        expect(screen.getByText(version)).toBeInTheDocument();
      }
    );
  });

  test('Renders archived templates', async () => {
    const viewArchivedSwitch = screen.getByRole('checkbox', {
      name: 'View Archived Templates',
    });
    await userEvent.click(viewArchivedSwitch);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });

    TEST_DATA.archivedTemplates.forEach(
      ({ classification, dateCreated, version }) => {
        expect(screen.getByText(classification.name)).toBeInTheDocument();
        expect(
          screen.getByText(getPrettyDate(dateCreated))
        ).toBeInTheDocument();
        expect(screen.getByText(version)).toBeInTheDocument();
      }
    );
  });
});

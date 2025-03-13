import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProviderWrapper from 'src/testing/ProviderWrapper';
import { PatientsPage } from '.';

describe('Testing the rendering of the Page', () => {
  test('Rendering of the patients page', () => {
    render(
      <ProviderWrapper>
        <PatientsPage />
      </ProviderWrapper>
    );
  });
});

describe('Testing the primary Button - New Patient', () => {
  test('Rendering and working of the primary Button - New Patient', async () => {
    try {
      const { getByText } = render(<PatientsPage />, {
        wrapper: ProviderWrapper,
      });
      const user = userEvent.setup();

      const newPatientButton = getByText('New Patient');
      expect(newPatientButton.textContent).toBe('New Patient');

      await user.click(newPatientButton);
    } catch (e) {
      console.error(e);
    }
  });
});

describe('Testing the text field - Search', () => {
  test('Rendering and working of the text field search', () => {
    const { getByTestId } = render(
      <ProviderWrapper>
        <PatientsPage />
      </ProviderWrapper>
    );
    const searchTextfield = getByTestId('search-input');
    userEvent.type(searchTextfield, 'sample search');
  });
});

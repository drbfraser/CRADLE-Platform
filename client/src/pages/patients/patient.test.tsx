import { MaterialUIContextProvider as ContextProvider } from 'src/context/providers/materialUI';
import { PatientsPage } from '.';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { PropsWithChildren } from 'react';

const TestProvider = ({ children }: PropsWithChildren) => {
  return (
    <MemoryRouter>
      <ContextProvider>{children}</ContextProvider>
    </MemoryRouter>
  );
};

describe('Testing the rendering of the Page', () => {
  test('Rendering of the patients page', () => {
    render(
      <TestProvider>
        <PatientsPage />
      </TestProvider>
    );
  });
});

describe('Testing the primary Button - New Patient', () => {
  test('Rendering and working of the primary Button - New Patient', async () => {
    const { getByText } = render(<PatientsPage />, { wrapper: TestProvider });
    const user = userEvent.setup();

    // Get New Patient button.
    const newPatientButton = getByText('New Patient');
    expect(newPatientButton.textContent).toBe('New Patient');

    // Click button.
    await user.click(newPatientButton);
  });
});

describe('Testing the text field - Search', () => {
  test('Rendering and working of the text field search', () => {
    const { getByTestId } = render(
      <TestProvider>
        <PatientsPage />
      </TestProvider>
    );
    const searchTextfield = getByTestId('search-input');
    userEvent.type(searchTextfield, 'sample search');
  });
});

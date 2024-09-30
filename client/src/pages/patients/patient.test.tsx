import { ContextProvider } from 'src/context';
import { PatientsPage } from '.';
import { render } from '@testing-library/react';
import { history } from 'src/redux/reducers/history';
import userEvent from '@testing-library/user-event';

describe('Testing the rendering of the Page', () => {
  test('Rendering of the patients page', () => {
    render(
      <ContextProvider>
        <PatientsPage />
      </ContextProvider>
    );
  });
});

describe('Testing the primary Button - New Patient', () => {
  test('Rendering and working of the primary Button - New Patient', () => {
    const historyLength = history.length;
    const { getByText } = render(
      <ContextProvider>
        <PatientsPage />
      </ContextProvider>
    );
    const newPatientButton = getByText('New Patient');
    expect(newPatientButton.textContent).toBe('New Patient');
    userEvent.click(newPatientButton);
    expect(history.length).toBe(historyLength + 1);
  });
});

describe('Testing the text field - Search', () => {
  test('Rendering and working of the text field search', () => {
    const { getByTestId } = render(
      <ContextProvider>
        <PatientsPage />
      </ContextProvider>
    );
    const searchTextfield = getByTestId('search-input');
    userEvent.type(searchTextfield, 'sample search');
  });
});

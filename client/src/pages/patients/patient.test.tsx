import { ContextProvider } from 'src/context';
import { PatientsPage } from '.';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { PropsWithChildren } from 'react';
import { createMemoryHistory } from 'history';

// History object stored in memory, for non-browser environments.
let memoryHistory = createMemoryHistory();

const TestProvider = ({ children }: PropsWithChildren) => {
  return (
    <Router history={memoryHistory}>
      <ContextProvider>{children}</ContextProvider>
    </Router>
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
  test('Rendering and working of the primary Button - New Patient', () => {
    const historyLength = memoryHistory.length;
    const { getByText } = render(
      <TestProvider>
        <PatientsPage />
      </TestProvider>
    );
    const newPatientButton = getByText('New Patient');
    expect(newPatientButton.textContent).toBe('New Patient');
    userEvent.click(newPatientButton);
    expect(memoryHistory.length).toBe(historyLength + 1);

    memoryHistory = createMemoryHistory(); // Reset history.
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

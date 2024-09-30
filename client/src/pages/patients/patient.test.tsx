import { ContextProvider } from 'src/context';
import { PatientsPage } from '.';
import { render } from '@testing-library/react';
import { history } from 'src/redux/reducers/history';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { PropsWithChildren } from 'react';

const TestProvider = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      <ContextProvider>{children}</ContextProvider>
    </BrowserRouter>
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
    const historyLength = history.length;
    const { getByText } = render(
      <TestProvider>
        <PatientsPage />
      </TestProvider>
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
      <TestProvider>
        <PatientsPage />
      </TestProvider>
    );
    const searchTextfield = getByTestId('search-input');
    userEvent.type(searchTextfield, 'sample search');
  });
});

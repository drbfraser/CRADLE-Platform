import { DimensionsContext, DimensionsContextProvider } from 'src/app/context';
import { fireEvent, render } from '@testing-library/react';

import { ContextProvider } from 'src/context';
import { Paper } from '@mui/material';
import { PatientsPage } from '.';
import { PrimaryButton } from 'src/shared/components/Button';
import React from 'react';
import { TextField } from 'formik-mui';
import { makeStyles } from '@material-ui/core/styles';
import { screen } from '@testing-library/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';

describe('Testing the rendering of the Page', () => {
  test('Rendering of the patients page', () => {
    render(
      <ContextProvider>
        <DimensionsContextProvider
          drawerWidth={100}
          offsetFromTop={100}
          isBigScreen={true}>
          <PatientsPage />
        </DimensionsContextProvider>
      </ContextProvider>
    );
  });
});

describe('Testing the primary Button - New Patient', () => {
  test('Rendering and working of the primary Button - New Patient', () => {
    const historyLength = history.length;
    const { getByText } = render(
      <ContextProvider>
        <DimensionsContextProvider
          drawerWidth={100}
          offsetFromTop={100}
          isBigScreen={true}>
          <PatientsPage />
        </DimensionsContextProvider>
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
        <DimensionsContextProvider
          drawerWidth={100}
          offsetFromTop={100}
          isBigScreen={true}>
          <PatientsPage />
        </DimensionsContextProvider>
      </ContextProvider>
    );
    const searchTextfield = getByTestId('search-input');
    userEvent.type(searchTextfield, 'sample search');
  });
});

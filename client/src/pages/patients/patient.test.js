import { fireEvent, render } from '@testing-library/react';

import { Paper } from '@mui/material';
import { PatientsPage } from '.';
import { PrimaryButton } from 'src/shared/components/Button';
import React from 'react';
import { TextField } from 'formik-mui';
import { screen } from '@testing-library/react';
import { useState } from 'react'
import userEvent from '@testing-library/user-event';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

describe("Testing the rendering of the Page",()=>{
    test("Rendering of the patients page", ()=> {
        render(<PatientsPage />)
    })
})

describe("Testing the primary Button - New Patient",()=>{

    test("Rendering and working of the primary Button - New Patient", ()=>{
        const historyLength = history.length
        const { getByText } =  render(<PatientsPage />)
        const newPatientButton = getByText("New Patient")
        expect(newPatientButton.textContent).toBe("New Patient")
        userEvent.click(newPatientButton)
        expect(history.length).toBe(historyLength+1)
    })
})

describe("Testing the text field - Search",()=>{
    test("Rendering and working of the text field search",()=>{
        const { getByTestId } =  render(<PatientsPage />)
        const searchTextfield = getByTestId("search-input")
        userEvent.type(searchTextfield,"sample search")
    })
})

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { PrimaryButton } from "src/shared/components/Button";
import { TextField } from "formik-material-ui";
import { Paper } from "@mui/material";
import { PatientsPage } from ".";

test("Rendering of the patients page", ()=> {
    render(<PatientsPage />)
})

test("Rendering of the primary Button - New Patient", ()=>{
    const handleNewPatientClick = jest.fn()
    const { getByText } =  render(<PatientsPage />)
    const newPatientButton = getByText("New Patient")
    expect(newPatientButton.textContent).toBe("New Patient")
   
})

test("Rendering of the text field - Search", ()=> {
    const { getByTestId } =  render(<PatientsPage />)
    const searchTextfield = getByTestId("search-input")
})
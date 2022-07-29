import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { PrimaryButton } from "src/shared/components/Button";
import { TextField } from "formik-material-ui";
import { Paper } from "@material-ui/core";
import { PatientsPage } from ".";
//import 'jest-dom/extend-expect'

test("Rendering of the patients page", ()=> {
    render(<PatientsPage />)
})

test("Testing the primary Button - New Patient", ()=>{

    const { getByText } =  render(<PatientsPage />)
    const newPatientButton = getByText("New Patient")
    expect(newPatientButton.textContent).toBe("New Patient")
    //fireEvent.click(newPatientButton)
    //expect(handleNewPatientClick).toHaveBeenCalledTimes(1);
    /*
    const handleNewPatientClick = jest.fn()
    const { getByText } = render(<PrimaryButton onClick={handleNewPatientClick}/>)
    const newPatientButton = getByText("New Patient")
    console.log(newPatientButton)
    expect(newPatientButton.textContent).toBe("New Patient")
    fireEvent.click(newPatientButton)
    expect(handleNewPatientClick).toHaveBeenCalledTimes(1);
    */
   
})

test("Testing the text field - Search", ()=> {
    const { getByTestId } =  render(<PatientsPage />)
    const searchTextfield = getByTestId("search-input")
})
import React from "react";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { CancelButton, PrimaryButton, RedirectButton, SecondaryButton } from "..";

describe("Rendering all the buttons", ()=>{

    test("Render a primary button",()=>{
        const { getByTestId } = render(<PrimaryButton />)
        const primaryButton = getByTestId("primary")
        expect(primaryButton).toBeTruthy();
    })

    test("Render a secondary button",()=>{
        const { getByTestId } = render(<SecondaryButton />)
        const secondaryButton = getByTestId("secondary")
        expect(secondaryButton).toBeTruthy();
    })

    test("Render a cancel button",()=>{
        const { getByTestId } = render(<CancelButton />)
        const cancelButton = getByTestId("cancel")
        expect(cancelButton).toBeTruthy();
    })

    test("Render a redirect button",()=>{
        render(<RedirectButton />)
    })

})
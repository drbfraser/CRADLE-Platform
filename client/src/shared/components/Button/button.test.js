
import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { CancelButton, PrimaryButton, RedirectButton, SecondaryButton } from ".";

describe("Rendering and testing all types of buttons", ()=>{

    describe("testing the rendering, and all the components of the Primary Button", ()=>{

        test("Render a primary button", ()=>{
            render(<PrimaryButton />)
        })

        test("onCLick property of Primary Button", ()=>{
            const handlePrimaryButtonClick = jest.fn()
            const { getByTestId } = render(<PrimaryButton onClick={handlePrimaryButtonClick} />)
            const primaryButton = getByTestId("primary")
            fireEvent.click(primaryButton)
            expect(handlePrimaryButtonClick).toHaveBeenCalledTimes(1)
        })

        test("colour of the primary button",()=>{
            const { getByTestId } = render(<PrimaryButton />)
            const primaryButton = getByTestId("primary")
            const buttonStyle = window.getComputedStyle(primaryButton)
            const backgroundColor = buttonStyle["color"]
            expect(backgroundColor).toEqual("rgb(255, 255, 255)");
        })
})

    describe("testing the rendering, and all the components of the Secondary Button",()=>{
        test("Render a secondary button", ()=>{
            render(<SecondaryButton />)
        })

        test("onCLick property of Secondary Button", ()=>{
            const handleSecondaryButtonClick = jest.fn()
            const { getByTestId } = render(<SecondaryButton onClick={handleSecondaryButtonClick} />)
            const secondaryButton = getByTestId("secondary")
            fireEvent.click(secondaryButton)
            expect(handleSecondaryButtonClick).toHaveBeenCalledTimes(1)
        })

        test("colour of the secondary button",()=>{
            const { getByTestId } = render(<SecondaryButton />)
            const secondaryButton = getByTestId("secondary")
            const buttonStyle = window.getComputedStyle(secondaryButton)
            const backgroundColor = buttonStyle["color"]
            expect(backgroundColor).toEqual("rgb(63, 81, 181)");
        })

    })

    describe("Testing the rendering and all the components of the cancel button", ()=>{

        test("Render a cancel button", ()=>{
            render(<CancelButton />)
        })

        test("onCLick property of Cancel Button", ()=>{
            const handleCancelButtonClick = jest.fn()
            const { getByTestId } = render(<CancelButton onClick={handleCancelButtonClick} />)
            const cancelButton = getByTestId("cancel")
            fireEvent.click(cancelButton)
            expect(handleCancelButtonClick).toHaveBeenCalledTimes(1)
        })

        test("colour of the cancel button",()=>{
            const { getByTestId } = render(<CancelButton />)
            const cancelButton = getByTestId("cancel")
            const buttonStyle = window.getComputedStyle(cancelButton)
            const backgroundColor = buttonStyle["color"]
            expect(backgroundColor).toEqual("rgb(244, 67, 54)");
        })
    })

    describe("Testing the rendering of the redirect button",()=>{

        test("Render a redirect button",()=>{
            render(<RedirectButton />)
        })

    })

})
import React from "react";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { CancelButton, PrimaryButton, RedirectButton, SecondaryButton } from "..";

test("Render a primary button",()=>{
    render(<PrimaryButton />)
})

test("Render a secondary button",()=>{
    render(<SecondaryButton />)
})

test("Render a cancel button",()=>{
    render(<CancelButton />)
})

test("Render a ridirect button",()=>{
    render(<RedirectButton />)
})

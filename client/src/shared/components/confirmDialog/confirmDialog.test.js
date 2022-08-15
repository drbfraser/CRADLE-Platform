import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { ConfirmDialog } from '.';

describe('Testing the rendering and the components of confirmDialog', () => {
  test('Render the dialog', () => {
    render(<ConfirmDialog open={true} />);
  });

  test('Rendering of the primary button inside the dialoge', () => {
    const { getByText } = render(<ConfirmDialog open={true} />);
    const yesPrimaryButton = getByText('Yes');
    expect(yesPrimaryButton.textContent).toBe('Yes');
  });

  test('Rendering of the cancel button inside the dialog', () => {
    const { getByText } = render(<ConfirmDialog open={true} />);
    const noCancelButton = getByText('No');
    expect(noCancelButton.textContent).toBe('No');
  });

  test('Rendering of the alert inside the dialog', () => {
    const { getByTestId } = render(<ConfirmDialog open={true} />);
    const warningAlert = getByTestId('warningAlert');
  });
});

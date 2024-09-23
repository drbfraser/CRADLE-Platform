import { ConfirmDialog } from '.';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

describe('Testing the rendering and the components of confirmDialog', () => {
  test('Render the dialog', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title={'Test'}
        content={'Content'}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );
  });

  test('Rendering of the primary button inside the dialog', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    const { getByText } = render(
      <ConfirmDialog
        open={true}
        title={'Test'}
        content={'Content'}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const yesPrimaryButton = getByText('Yes');
    expect(yesPrimaryButton.textContent).toBe('Yes');
  });

  test('Rendering of the cancel button inside the dialog', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    const { getByText } = render(
      <ConfirmDialog
        open={true}
        title={'Test'}
        content={'Content'}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );
    const noCancelButton = getByText('No');
    expect(noCancelButton.textContent).toBe('No');
  });

  test('Rendering of the alert inside the dialog', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    const { getByTestId } = render(
      <ConfirmDialog
        open={true}
        title={'Test'}
        content={'Warning'}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );
    const warningAlert = getByTestId('warningAlert');
    expect(warningAlert.textContent).toBe('Warning');
  });
});

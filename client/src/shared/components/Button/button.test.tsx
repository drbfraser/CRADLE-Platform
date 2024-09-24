import {
  CancelButton,
  PrimaryButton,
  RedirectButton,
  SecondaryButton,
} from '.';
import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

describe('Rendering and testing all types of buttons', () => {
  describe('testing the rendering, and all the components of the Primary Button', () => {
    test('Render a primary button', () => {
      render(<PrimaryButton />);
    });

    test('onCLick property of Primary Button', () => {
      const handlePrimaryButtonClick = vi.fn();
      const { getByTestId } = render(
        <PrimaryButton
          data-testid="primary"
          onClick={handlePrimaryButtonClick}
        />
      );
      const primaryButton = getByTestId('primary');
      fireEvent.click(primaryButton);
      expect(handlePrimaryButtonClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('testing the rendering, and all the components of the Secondary Button', () => {
    test('Render a secondary button', () => {
      render(<SecondaryButton />);
    });

    test('onCLick property of Secondary Button', () => {
      const handleSecondaryButtonClick = vi.fn();
      const { getByTestId } = render(
        <SecondaryButton
          data-testid="secondary"
          onClick={handleSecondaryButtonClick}
        />
      );
      const secondaryButton = getByTestId('secondary');
      fireEvent.click(secondaryButton);
      expect(handleSecondaryButtonClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Testing the rendering and all the components of the cancel button', () => {
    test('Render a cancel button', () => {
      render(<CancelButton />);
    });

    test('onCLick property of Cancel Button', () => {
      const handleCancelButtonClick = vi.fn();
      const { getByTestId } = render(
        <CancelButton data-testid="cancel" onClick={handleCancelButtonClick} />
      );
      const cancelButton = getByTestId('cancel');
      fireEvent.click(cancelButton);
      expect(handleCancelButtonClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Testing the rendering of the redirect button', () => {
    test('Render a redirect button', () => {
      render(<RedirectButton url="" />);
    });
  });
});

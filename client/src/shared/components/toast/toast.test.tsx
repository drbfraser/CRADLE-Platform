import { ContextProvider } from 'src/context';
import { Toast } from '.';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

describe('Testing the rendering and the components of toast', () => {
  test('Rendering of the toast', () => {
    const mockFn = vi.fn();
    render(
      <ContextProvider>
        <Toast message={'Test'} onClose={mockFn} open={true} severity="error" />
      </ContextProvider>
    );
  });
});

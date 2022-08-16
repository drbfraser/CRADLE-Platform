import { ContextProvider } from 'src/context';
import { Toast } from '.';
import { render } from '@testing-library/react';

describe('Testing the rendering and the components of toast', () => {
  test('Rendering of the toast', () => {
    const fn = jest.fn();
    render(
      <ContextProvider>
        <Toast message={'Test'} onClose={fn} open={true} severity="error" />
      </ContextProvider>
    );
  });
});

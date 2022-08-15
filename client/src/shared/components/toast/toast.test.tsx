import { ContextProvider } from 'src/context';
import React from 'react';
import { Toast } from '.';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';

describe('Testing the rendering and the components of toast', () => {
  test('Rendering of the toast', () => {
    render(
      <ContextProvider>
        <Toast />
      </ContextProvider>
    );
  });
});

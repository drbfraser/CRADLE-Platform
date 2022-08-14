import React from 'react';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { Toast } from '.';

describe('Testing the rendering and the components of toast', () => {
  test('Rendering of the toast', () => {
    render(<Toast />);
  });
});

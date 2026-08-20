import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormRenderStateEnum } from 'src/shared/enums';
import { CategoryField } from './CategoryField';
import { makeFieldProps } from './questionFieldTestUtils';

describe('CategoryField', () => {
  it('renders the category header text and no input controls', () => {
    const { container } = render(
      <CategoryField
        {...makeFieldProps({
          text: 'Section A',
          renderState: FormRenderStateEnum.FIRST_SUBMIT,
        })}
      />
    );

    expect(screen.getByText('Section A')).toBeInTheDocument();
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
  });
});

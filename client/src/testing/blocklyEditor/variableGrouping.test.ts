import { describe, it, expect } from 'vitest';
import {
  inferSourceKeyFromTag,
  inferVariableSourceKey,
  resolveVariableBlockType,
  variableSourceLabel,
} from 'src/shared/components/workflow/blocklyEditor/variableGrouping';
import { TEST_VARIABLES } from './blocklyTestHarness';

describe('variableGrouping', () => {
  it('infers source from namespace, collectionName, or tag prefix', () => {
    expect(inferVariableSourceKey(TEST_VARIABLES[0]!)).toBe('patient');
    expect(inferVariableSourceKey(TEST_VARIABLES[1]!)).toBe('forms');
    expect(inferSourceKeyFromTag('vitals.bp_systolic')).toBe('vitals');
    expect(inferSourceKeyFromTag('forms[latest].q2')).toBe('forms');
  });

  it('maps source keys to readable toolbox labels', () => {
    expect(variableSourceLabel('patient')).toBe('Patient');
    expect(variableSourceLabel('forms')).toBe('Form Questions');
  });

  it('resolves source-specific variable block types for saved rules', () => {
    expect(
      resolveVariableBlockType('patient.age', TEST_VARIABLES, 'Number')
    ).toBe('app_variable_patient_Number');
    expect(
      resolveVariableBlockType('forms[latest].q1', TEST_VARIABLES, 'String')
    ).toBe('app_variable_forms_String');
  });
});

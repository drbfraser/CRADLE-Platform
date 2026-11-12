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

  it('resolves the generic per-source variable block for saved rules', () => {
    expect(resolveVariableBlockType('patient.age', TEST_VARIABLES)).toBe(
      'app_variable_patient'
    );
    expect(resolveVariableBlockType('patient.dob', TEST_VARIABLES)).toBe(
      'app_variable_patient'
    );
    expect(resolveVariableBlockType('forms[latest].q1', TEST_VARIABLES)).toBe(
      'app_variable_forms'
    );
  });
});

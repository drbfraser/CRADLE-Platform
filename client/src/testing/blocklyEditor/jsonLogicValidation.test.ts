import { describe, it, expect } from 'vitest';
import {
  comparisonBlockType,
  inferBlocklyType,
} from 'src/shared/components/workflow/blocklyEditor/ruleTypeInference';
import {
  stripRuleMetadata,
  validateJsonLogic,
} from 'src/shared/components/workflow/blocklyEditor/jsonLogicGenerator';

const tagToType = new Map<string, string | null>([
  ['patient.age', 'Number'],
  ['forms[latest].q1', 'String'],
  ['patient.dob', 'Date'],
]);

describe('validateJsonLogic', () => {
  it('accepts a complete number comparison at root', () => {
    const rule = { '>': [{ var: 'patient.age' }, 18] };
    expect(validateJsonLogic(rule, true)).toBe(true);
  });

  it('accepts string contains with case sensitivity flag', () => {
    const rule = {
      contains: [{ var: 'forms[latest].q1' }, 'Yes', true],
    };
    expect(validateJsonLogic(rule, true)).toBe(true);
  });

  it('accepts string length nested in comparison', () => {
    const rule = { '>': [{ length: [{ var: 'forms[latest].q1' }] }, 3] };
    expect(validateJsonLogic(rule, true)).toBe(true);
  });

  it('rejects incomplete comparison with null operands', () => {
    const rule = { '==': [null, 'Yes'] };
    expect(validateJsonLogic(rule, true)).toBe(false);
  });

  it('rejects empty workspace equivalent at root', () => {
    expect(validateJsonLogic(null, true)).toBe(false);
  });

  it('strips name metadata before validating', () => {
    const rule = {
      '==': [{ var: 'forms[latest].q1' }, 'Yes'],
      name: 'branch-a',
    };
    expect(validateJsonLogic(stripRuleMetadata(rule), true)).toBe(true);
  });
});

describe('ruleTypeInference', () => {
  it('maps variable tags to blockly types', () => {
    expect(inferBlocklyType({ var: 'patient.age' }, tagToType)).toBe('Number');
    expect(inferBlocklyType({ var: 'forms[latest].q1' }, tagToType)).toBe(
      'String'
    );
    expect(inferBlocklyType({ var: 'patient.dob' }, tagToType)).toBe('Date');
  });

  it('treats ISO date strings as Date literals', () => {
    expect(inferBlocklyType('2024-06-15', tagToType)).toBe('Date');
    expect(inferBlocklyType('Yes', tagToType)).toBe('String');
  });

  it('picks the correct comparison block type', () => {
    expect(
      comparisonBlockType({ var: 'forms[latest].q1' }, 'Yes', tagToType)
    ).toBe('string_comparison');
    expect(comparisonBlockType({ var: 'patient.age' }, 18, tagToType)).toBe(
      'number_comparison'
    );
    expect(
      comparisonBlockType({ var: 'patient.dob' }, { date: '2024-01-01' }, tagToType)
    ).toBe('date_comparison');
  });
});

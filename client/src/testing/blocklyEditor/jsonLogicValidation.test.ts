import { describe, it, expect } from 'vitest';
import {
  stripRuleMetadata,
  validateJsonLogic,
} from 'src/shared/components/workflow/blocklyEditor/jsonLogicGenerator';

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

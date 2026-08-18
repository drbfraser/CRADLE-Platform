import { describe, it, expect } from 'vitest';
import { validateRuleForPaste } from 'src/shared/components/workflow/blocklyEditor/validateRuleForPaste';
import { WorkflowVariable } from 'src/shared/api';

const patientAge: WorkflowVariable = {
  tag: 'patient.age',
  type: 'integer',
  isComputed: false,
  isDynamic: false,
};

const formQ1: WorkflowVariable = {
  tag: 'forms[latest].q1',
  type: 'string',
  namespace: 'forms',
  collectionName: 'forms',
  isComputed: false,
  isDynamic: true,
};

const formQ2: WorkflowVariable = {
  tag: 'forms[latest].q2',
  type: 'string',
  namespace: 'forms',
  collectionName: 'forms',
  isComputed: false,
  isDynamic: true,
};

describe('validateRuleForPaste', () => {
  it('rejects empty / null rules', () => {
    expect(
      validateRuleForPaste({ rule: '', availableVariables: [patientAge] })
    ).toMatchObject({ ok: false, hasWarnings: false });
    expect(
      validateRuleForPaste({ rule: null, availableVariables: [patientAge] })
    ).toMatchObject({ ok: false });
  });

  it('rejects invalid JSON', () => {
    const result = validateRuleForPaste({
      rule: '{bad',
      availableVariables: [patientAge],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/Invalid JSON/);
    }
  });

  it('allows paste when all variables exist on the target step', () => {
    const result = validateRuleForPaste({
      rule: {
        and: [
          { '>=': [{ var: 'patient.age' }, 18] },
          { '==': [{ var: 'forms[latest].q1' }, 'Yes'] },
        ],
      },
      availableVariables: [patientAge, formQ1],
    });
    expect(result).toEqual({
      ok: true,
      missingVariables: [],
      hasWarnings: false,
    });
  });

  it('warns but allows paste when form variables are missing on the target step', () => {
    const result = validateRuleForPaste({
      rule: JSON.stringify({
        '==': [{ var: 'forms[latest].q1' }, 'Yes'],
      }),
      // Target step only has q2 (different form)
      availableVariables: [patientAge, formQ2],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hasWarnings).toBe(true);
      expect(result.missingVariables).toEqual(['forms[latest].q1']);
    }
  });

  it('warns for unknown global tags as well', () => {
    const result = validateRuleForPaste({
      rule: { '>': [{ var: 'patient.unknownField' }, 1] },
      availableVariables: [patientAge],
    });
    expect(result).toEqual({
      ok: true,
      missingVariables: ['patient.unknownField'],
      hasWarnings: true,
    });
  });

  it('allows a rule with no variable references', () => {
    const result = validateRuleForPaste({
      rule: { '==': [true, true] },
      availableVariables: [],
    });
    expect(result).toEqual({
      ok: true,
      missingVariables: [],
      hasWarnings: false,
    });
  });
});

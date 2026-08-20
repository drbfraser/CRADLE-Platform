import { describe, it, expect } from 'vitest';
import { extractVariablesFromRule } from 'src/shared/components/workflow/blocklyEditor/extractRuleVariables';

describe('extractVariablesFromRule', () => {
  it('extracts a single comparison variable', () => {
    expect(
      extractVariablesFromRule({ '>': [{ var: 'patient.age' }, 18] })
    ).toEqual(['patient.age']);
  });

  it('parses a JSON string rule', () => {
    expect(
      extractVariablesFromRule(
        JSON.stringify({ '>=': [{ var: 'patient.age' }, 18] })
      )
    ).toEqual(['patient.age']);
  });

  it('extracts variables from compound and/or rules', () => {
    const rule = {
      and: [
        { '>=': [{ var: 'patient.age' }, 18] },
        { '<': [{ var: 'patient.age' }, 65] },
        { '==': [{ var: 'forms[latest].q1' }, 'Yes'] },
      ],
    };
    expect(extractVariablesFromRule(rule)).toEqual([
      'forms[latest].q1',
      'patient.age',
    ]);
  });

  it('extracts nested var with default array form', () => {
    expect(
      extractVariablesFromRule({
        '==': [{ var: ['forms[latest].q1', ''] }, 'Yes'],
      })
    ).toEqual(['forms[latest].q1']);
  });

  it('extracts variables from string ops and length', () => {
    const rule = {
      and: [
        { contains: [{ var: 'notes' }, 'flu', true] },
        { '>': [{ length: [{ var: 'name' }] }, 3] },
      ],
    };
    expect(extractVariablesFromRule(rule)).toEqual(['name', 'notes']);
  });

  it('ignores metadata keys like name', () => {
    const rule = {
      '>': [{ var: 'patient.age' }, 18],
      name: 'isAdult',
    };
    expect(extractVariablesFromRule(rule)).toEqual(['patient.age']);
  });

  it('returns empty array when rule has no variables', () => {
    expect(extractVariablesFromRule({ '==': [true, true] })).toEqual([]);
  });

  it('throws on invalid JSON string', () => {
    expect(() => extractVariablesFromRule('{not-json')).toThrow(
      'Invalid JSON in rule'
    );
  });

  it('throws on non-object rule after parse', () => {
    expect(() => extractVariablesFromRule('18')).toThrow(
      /Rule must be a dict or list/
    );
  });
});

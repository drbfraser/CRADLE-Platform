import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkflowRuleClipboardState } from 'src/shared/hooks/workflowTemplate/useWorkflowRuleClipboard';

describe('useWorkflowRuleClipboardState', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useWorkflowRuleClipboardState());
    expect(result.current.hasCopiedRule).toBe(false);
    expect(result.current.copiedRule).toBeNull();
    expect(result.current.peek()).toBeNull();
  });

  it('copies a rule and strips name metadata', () => {
    const { result } = renderHook(() => useWorkflowRuleClipboardState());
    const ruleWithName = JSON.stringify({
      '>': [{ var: 'patient.age' }, 18],
      name: 'Is Adult',
    });

    let copied = false;
    act(() => {
      copied = result.current.copy(ruleWithName, 'Triage → Adult Path');
    });

    expect(copied).toBe(true);
    expect(result.current.hasCopiedRule).toBe(true);
    expect(result.current.copiedRule?.sourceLabel).toBe('Triage → Adult Path');
    expect(JSON.parse(result.current.copiedRule!.rule)).toEqual({
      '>': [{ var: 'patient.age' }, 18],
    });
    expect(result.current.copiedRule!.rule).not.toContain('Is Adult');
  });

  it('rejects empty or invalid JSON on copy', () => {
    const { result } = renderHook(() => useWorkflowRuleClipboardState());

    act(() => {
      expect(result.current.copy('', 'A → B')).toBe(false);
      expect(result.current.copy('{bad', 'A → B')).toBe(false);
    });

    expect(result.current.hasCopiedRule).toBe(false);
  });

  it('overwrites previous copy', () => {
    const { result } = renderHook(() => useWorkflowRuleClipboardState());

    act(() => {
      result.current.copy(
        JSON.stringify({ '>': [{ var: 'patient.age' }, 18] }),
        'First'
      );
    });
    act(() => {
      result.current.copy(
        JSON.stringify({ '<': [{ var: 'patient.age' }, 65] }),
        'Second'
      );
    });

    expect(result.current.copiedRule?.sourceLabel).toBe('Second');
    expect(JSON.parse(result.current.copiedRule!.rule)).toEqual({
      '<': [{ var: 'patient.age' }, 65],
    });
  });

  it('clears the clipboard', () => {
    const { result } = renderHook(() => useWorkflowRuleClipboardState());

    act(() => {
      result.current.copy(
        JSON.stringify({ '>': [{ var: 'patient.age' }, 18] }),
        'A → B'
      );
    });
    act(() => {
      result.current.clear();
    });

    expect(result.current.hasCopiedRule).toBe(false);
    expect(result.current.peek()).toBeNull();
  });
});

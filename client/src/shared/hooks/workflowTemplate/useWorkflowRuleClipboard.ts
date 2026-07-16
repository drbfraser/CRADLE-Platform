import { useCallback, useState } from 'react';
import { stripRuleMetadata } from 'src/shared/components/workflow/blocklyEditor/jsonLogicGenerator';

export type CopiedRule = {
  /** JsonLogic string with display metadata (e.g. name) stripped. */
  rule: string;
  copiedAt: number;
  /** Human-readable source, e.g. "Triage → Adult Path". */
  sourceLabel: string;
};

export type WorkflowRuleClipboard = {
  copiedRule: CopiedRule | null;
  copy: (rule: string, sourceLabel: string) => boolean;
  peek: () => CopiedRule | null;
  hasCopiedRule: boolean;
  clear: () => void;
};

function stripNameFromRuleString(rule: string): string | null {
  try {
    const parsed = JSON.parse(rule);
    const stripped = stripRuleMetadata(parsed);
    return JSON.stringify(stripped);
  } catch {
    return null;
  }
}

/**
 * In-memory clipboard for workflow branch conditions while the editor is open.
 * Lives for the lifetime of the component that owns this state (provider).
 */
export function useWorkflowRuleClipboardState(): WorkflowRuleClipboard {
  const [copiedRule, setCopiedRule] = useState<CopiedRule | null>(null);

  const copy = useCallback((rule: string, sourceLabel: string): boolean => {
    if (!rule.trim()) return false;
    const stripped = stripNameFromRuleString(rule);
    if (stripped === null) return false;

    setCopiedRule({
      rule: stripped,
      copiedAt: Date.now(),
      sourceLabel,
    });
    return true;
  }, []);

  const peek = useCallback(() => copiedRule, [copiedRule]);

  const clear = useCallback(() => {
    setCopiedRule(null);
  }, []);

  return {
    copiedRule,
    copy,
    peek,
    hasCopiedRule: copiedRule !== null,
    clear,
  };
}

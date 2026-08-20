import { WorkflowVariable } from 'src/shared/api';
import { extractVariablesFromRule } from './extractRuleVariables';

export type PasteValidationResult =
  | {
      ok: false;
      reason: string;
      missingVariables: string[];
      hasWarnings: false;
    }
  | {
      ok: true;
      /** Tags referenced by the rule that are not in the target step catalogue. */
      missingVariables: string[];
      hasWarnings: boolean;
    };

/**
 * Check whether a copied JsonLogic rule can be pasted into a target step.
 *
 * missing form (or other) variables produce a **warning** but paste
 * is still allowed (`ok: true`). Only unparseable / empty rules are rejected.
 */
export function validateRuleForPaste(options: {
  rule: string | object | null | undefined;
  availableVariables: WorkflowVariable[];
}): PasteValidationResult {
  const { rule, availableVariables } = options;

  if (rule === null || rule === undefined || rule === '') {
    return {
      ok: false,
      reason: 'No condition to paste.',
      missingVariables: [],
      hasWarnings: false,
    };
  }

  let referenced: string[];
  try {
    referenced = extractVariablesFromRule(rule);
  } catch (err) {
    return {
      ok: false,
      reason:
        err instanceof Error ? err.message : 'Invalid condition rule JSON.',
      missingVariables: [],
      hasWarnings: false,
    };
  }

  const availableTags = new Set(availableVariables.map((v) => v.tag));
  const missingVariables = referenced.filter((tag) => !availableTags.has(tag));

  return {
    ok: true,
    missingVariables,
    hasWarnings: missingVariables.length > 0,
  };
}

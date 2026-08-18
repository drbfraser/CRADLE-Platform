const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ORDERED_COMPARISON_OPS = new Set(['>', '<', '>=', '<=']);

function extractVarTag(varValue: unknown): string | null {
  if (typeof varValue === 'string') return varValue;
  if (Array.isArray(varValue) && typeof varValue[0] === 'string') {
    return varValue[0];
  }
  return null;
}

export function inferBlocklyType(
  rule: unknown,
  tagToType: Map<string, string | null>
): string | null {
  if (typeof rule === 'number') return 'Number';
  if (typeof rule === 'boolean') return 'Boolean';
  if (typeof rule === 'string') {
    return ISO_DATE_RE.test(rule) ? 'Date' : 'String';
  }
  if (typeof rule === 'object' && rule !== null) {
    const ruleObj = rule as Record<string, unknown>;
    if ('date' in ruleObj) return 'Date';
    if ('var' in ruleObj) {
      const tag = extractVarTag(ruleObj.var);
      if (!tag) return null;
      // Unknown / missing variable
      return tagToType.get(tag) ?? null;
    }
    if ('length' in ruleObj) return 'Number';
  }
  return 'String';
}

export function comparisonBlockType(
  left: unknown,
  right: unknown,
  tagToType: Map<string, string | null>,
  op?: string
): string {
  const leftType = inferBlocklyType(left, tagToType);
  const rightType = inferBlocklyType(right, tagToType);

  let type: string | null;
  if (leftType && rightType) {
    type = leftType === rightType ? leftType : leftType;
  } else {
    type = leftType ?? rightType;
  }

  // Ordered compares are number/date; if both sides are unknown, prefer Number.
  if (!type && op && ORDERED_COMPARISON_OPS.has(op)) {
    type = 'Number';
  }

  switch (type) {
    case 'Number':
      return 'number_comparison';
    case 'Date':
      return 'date_comparison';
    case 'Boolean':
      return 'boolean_comparison';
    default:
      return 'string_comparison';
  }
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function inferBlocklyType(
  rule: unknown,
  tagToType: Map<string, string | null>
): string {
  if (typeof rule === 'number') return 'Number';
  if (typeof rule === 'boolean') return 'Boolean';
  if (typeof rule === 'string') {
    return ISO_DATE_RE.test(rule) ? 'Date' : 'String';
  }
  if (typeof rule === 'object' && rule !== null) {
    const ruleObj = rule as Record<string, unknown>;
    if ('date' in ruleObj) return 'Date';
    if ('var' in ruleObj) return tagToType.get(String(ruleObj.var)) ?? 'String';
    if ('length' in ruleObj) return 'Number';
  }
  return 'String';
}

export function comparisonBlockType(
  left: unknown,
  right: unknown,
  tagToType: Map<string, string | null>
): string {
  const leftType = inferBlocklyType(left, tagToType);
  const rightType = inferBlocklyType(right, tagToType);
  const type = leftType === rightType ? leftType : (leftType ?? rightType);

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

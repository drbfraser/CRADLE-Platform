/**
 * Extract variable tags from a JsonLogic rule.
 * Mirrors server JsonLogicParser: walks the tree and collects {"var": "tag"} refs.
 */

function addVarTag(variables: Set<string>, varValue: unknown): void {
  if (typeof varValue === 'string') {
    variables.add(varValue);
    return;
  }
  if (Array.isArray(varValue) && typeof varValue[0] === 'string') {
    variables.add(varValue[0]);
  }
}

function traverse(node: unknown, variables: Set<string>): void {
  if (node === null || node === undefined) return;

  if (Array.isArray(node)) {
    for (const item of node) {
      traverse(item, variables);
    }
    return;
  }

  if (typeof node !== 'object') return;

  const obj = node as Record<string, unknown>;
  if ('var' in obj) {
    addVarTag(variables, obj.var);
  }
  for (const value of Object.values(obj)) {
    traverse(value, variables);
  }
}

/**
 * Collect all variable path tags referenced by a JsonLogic rule.
 * Accepts a JSON string or already-parsed object.
 * Returns tags in sorted order for stable comparisons.
 */
export function extractVariablesFromRule(rule: string | object): string[] {
  let parsed: unknown = rule;
  if (typeof rule === 'string') {
    try {
      parsed = JSON.parse(rule);
    } catch {
      throw new Error('Invalid JSON in rule');
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(
      `Rule must be a dict or list, got ${parsed === null ? 'null' : typeof parsed}`
    );
  }

  const variables = new Set<string>();
  traverse(parsed, variables);
  return Array.from(variables).sort();
}

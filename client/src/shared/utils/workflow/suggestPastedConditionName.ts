/**
 * Suggest a display name after pasting a condition.
 */
export function suggestPastedConditionName(sourceLabel: string): string {
  const trimmed = sourceLabel.trim();
  if (!trimmed) return '';
  return `Copied from ${trimmed}`;
}

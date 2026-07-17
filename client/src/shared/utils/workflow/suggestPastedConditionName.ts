/**
 * Suggest a display name after pasting a condition.
 * Spec: do not copy the original name; offer a clear "Copied from …" label.
 */
export function suggestPastedConditionName(sourceLabel: string): string {
  const trimmed = sourceLabel.trim();
  if (!trimmed) return '';
  return `Copied from ${trimmed}`;
}

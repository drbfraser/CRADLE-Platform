import { describe, it, expect } from 'vitest';
import { suggestPastedConditionName } from 'src/shared/utils/workflow/suggestPastedConditionName';

describe('suggestPastedConditionName', () => {
  it('prefixes the source label', () => {
    expect(suggestPastedConditionName('Triage → Adult Path')).toBe(
      'Copied from Triage → Adult Path'
    );
  });

  it('returns empty string for blank labels', () => {
    expect(suggestPastedConditionName('')).toBe('');
    expect(suggestPastedConditionName('   ')).toBe('');
  });
});

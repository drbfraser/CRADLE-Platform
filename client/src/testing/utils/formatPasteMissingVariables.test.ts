import { describe, it, expect } from 'vitest';
import { formatMissingVariablesWarning } from 'src/shared/utils/workflow/formatPasteMissingVariables';

describe('formatMissingVariablesWarning', () => {
  it('explains missing form questions clearly', () => {
    const msg = formatMissingVariablesWarning(['forms[latest].dob_question']);
    expect(msg).toContain('form question "dob_question"');
    expect(msg).toContain('not on this step');
    expect(msg).toContain('left empty');
  });

  it('mentions other missing variables', () => {
    const msg = formatMissingVariablesWarning(['patient.unknownField']);
    expect(msg).toContain('"patient.unknownField"');
    expect(msg).toContain('not available on this step');
  });

  it('returns empty string when nothing is missing', () => {
    expect(formatMissingVariablesWarning([])).toBe('');
  });
});

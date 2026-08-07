import moment from 'moment';
import { DescriptionVariableResolution } from 'src/shared/api/modules/workflowInstance';

// Matches any `{{...}}` token that ISN'T the startDate anchor -- that one is
// handled separately by descriptionTemplate.ts, which supports the `+3d`
// offset grammar. This covers rule-engine variable tags instead, e.g.
// `{{patient.age}}`, `{{pregnancies[latest].start_date}}`.
const VARIABLE_TOKEN_PATTERN = /\{\{\s*(?!startDate\b)([^{}]+?)\s*\}\}/gi;

// Tags whose resolved value is a Unix-epoch-seconds timestamp that should
// render as a calendar date, not a raw number. The rule engine's variable
// type registry marks these as INTEGER (correct for rule comparisons like
// `>=`), so display formatting has to be handled here rather than inferred
// from that type.
const DATE_VALUE_TAGS = new Set([
  'pregnancies[latest].start_date',
  'pregnancies[latest].end_date',
]);

function formatResolvedValue(tag: string, value: string | number | boolean) {
  if (DATE_VALUE_TAGS.has(tag) && typeof value === 'number') {
    return moment.unix(value).format('MMM D, YYYY');
  }
  return String(value);
}

/** Pull every non-startDate `{{...}}` tag out of a description, deduplicated. */
export function extractVariableTags(description: string): string[] {
  const tags = new Set<string>();
  for (const match of description.matchAll(VARIABLE_TOKEN_PATTERN)) {
    tags.add(match[1].trim());
  }
  return Array.from(tags);
}

/**
 * Substitute resolved rule-engine variables into a description. Values are
 * resolved live (current data) each time this is called -- see
 * server/service/workflow/datasourcing/description_variables.py's module
 * docstring for why "floating" is the only behavior implemented so far.
 */
export function resolveDescriptionVariables(
  description: string,
  resolutions: DescriptionVariableResolution[]
): string {
  const byTag = new Map(resolutions.map((r) => [r.var, r]));

  return description.replace(VARIABLE_TOKEN_PATTERN, (_match, rawTag: string) => {
    const tag = rawTag.trim();
    const resolution = byTag.get(tag);

    if (!resolution) {
      // Not fetched yet (e.g. still loading) or unknown.
      return `[${tag}]`;
    }

    switch (resolution.status) {
      case 'RESOLVED':
        return resolution.value === null || resolution.value === undefined
          ? `[${tag}]`
          : formatResolvedValue(tag, resolution.value);
      case 'NOT_IMPLEMENTED':
        return `[${tag} — not yet available]`;
      case 'NO_DATA':
      case 'INVALID_VARIABLE':
      default:
        return `[${tag}]`;
    }
  });
}

import moment from 'moment';
import { DescriptionVariableResolution } from 'src/shared/api/modules/workflowInstance';

// Matches any `{{...}}` token that ISN'T the startDate anchor, that one is
// handled separately by descriptionTemplate.ts.
const VARIABLE_TOKEN_PATTERN = /\{\{\s*(?!startDate\b)([^{}]+?)\s*\}\}/gi;

// Tags whose resolved value is a Unix-epoch-seconds timestamp that should
// render as a calendar date. The rule engine's variable
// type registry marks these as INTEGER (correct for rule comparisons like
// `>=`), so display formatting has to be handled here rather than inferred
// from that type.
const DATE_VALUE_TAGS = new Set([
  'pregnancies[latest].start_date',
  'pregnancies[latest].end_date',
  'vitals[latest].date_taken',
]);

// Readable names for the variables curated in DescriptionInsertPicker,
// used to build clearer unresolved-placeholder messages (e.g.
// "(pregnancy start date doesn't exist)" instead of a raw tag in brackets).
// Falls back to the raw tag for anything typed by hand / picked from the
// full searchable catalogue that isn't in this list.
const FRIENDLY_LABELS: Record<string, string> = {
  'patient.age': 'patient age',
  'patient.allergy': 'patient allergies',
  'patient.drug_history': 'patient medications',
  'pregnancies[latest].start_date': 'pregnancy start date',
  'pregnancies[latest].end_date': 'pregnancy end date',
  'pregnancies[latest].outcome': 'pregnancy outcome',
  'vitals[latest].systolic_blood_pressure': 'systolic blood pressure',
  'vitals[latest].diastolic_blood_pressure': 'diastolic blood pressure',
  'vitals[latest].heart_rate': 'heart rate',
  'vitals[latest].date_taken': 'reading date',
  'vitals[latest].is_flagged_for_follow_up': 'follow-up flag',
  'vitals.size': 'number of readings',
  'vitals[latest].urine_test.leukocytes': 'urine leukocytes',
  'vitals[latest].urine_test.nitrites': 'urine nitrites',
  'vitals[latest].urine_test.glucose': 'urine glucose',
  'vitals[latest].urine_test.protein': 'urine protein',
  'vitals[latest].urine_test.blood': 'urine blood',
};

function describeTag(tag: string): string {
  return FRIENDLY_LABELS[tag] ?? tag;
}

function formatResolvedValue(tag: string, value: string | number | boolean) {
  if (DATE_VALUE_TAGS.has(tag) && typeof value === 'number') {
    return moment.unix(value).format('MMM D, YYYY');
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
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
 * resolved live (current data) each time this is called.
 */
export function resolveDescriptionVariables(
  description: string,
  resolutions: DescriptionVariableResolution[]
): string {
  const byTag = new Map(resolutions.map((r) => [r.var, r]));

  return description.replace(
    VARIABLE_TOKEN_PATTERN,
    (_match, rawTag: string) => {
      const tag = rawTag.trim();
      const resolution = byTag.get(tag);

      if (!resolution) {
        // Not fetched yet (e.g. still loading) or unknown.
        return `(${describeTag(tag)} not loaded)`;
      }

      switch (resolution.status) {
        case 'RESOLVED':
          return resolution.value === null || resolution.value === undefined
            ? `(${describeTag(tag)} doesn't exist)`
            : formatResolvedValue(tag, resolution.value);
        case 'NOT_IMPLEMENTED':
          return `(${describeTag(tag)} not yet available)`;
        case 'INVALID_VARIABLE':
          return `(unrecognized variable: ${tag})`;
        case 'NO_DATA':
        default:
          return `(${describeTag(tag)} doesn't exist)`;
      }
    }
  );
}

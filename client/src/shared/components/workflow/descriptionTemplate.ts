import moment from 'moment';

const DATE_TOKEN_PATTERN =
  /\{\{\s*today\s*(?:([+-])\s*(\d+)\s*(d|w|m|y)\s*)?\}\}/gi;

const UNIT_BY_LETTER: Record<string, moment.unitOfTime.DurationConstructor> = {
  d: 'days',
  w: 'weeks',
  m: 'months',
  y: 'years',
};

/**
 * Resolves computed date placeholders (e.g. `{{today}}`, `{{today+3d}}`,
 * `{{today-2w}}`) in a step description into a formatted date string,
 * evaluated relative to the moment the description is rendered.
 */
export function resolveDescriptionTemplate(description: string): string {
  return description.replace(
    DATE_TOKEN_PATTERN,
    (_match, sign?: string, amount?: string, unit?: string) => {
      const date = moment();
      if (sign && amount && unit) {
        const offset = Number(amount) * (sign === '-' ? -1 : 1);
        date.add(offset, UNIT_BY_LETTER[unit.toLowerCase()]);
      }
      return date.format('MMM D, YYYY');
    }
  );
}

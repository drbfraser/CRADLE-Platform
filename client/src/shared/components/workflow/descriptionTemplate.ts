import moment from 'moment';

const DATE_TOKEN_PATTERN =
  /\{\{\s*startDate\s*(?:([+-])\s*(\d+)\s*(d|w|m|y)\s*)?\}\}/gi;

const UNIT_BY_LETTER: Record<string, moment.unitOfTime.DurationConstructor> = {
  d: 'days',
  w: 'weeks',
  m: 'months',
  y: 'years',
};

export type DescriptionTemplateContext = {
  /** Epoch seconds the step actually started, for the `{{startDate...}}` token. */
  startDate?: number;
};

/**
 * Resolves `{{startDate...}}` placeholders in a step description into a
 * formatted date string, evaluated relative to `context.startDate` (epoch
 * seconds) so it stays fixed once the step has actually started.
 *
 * If no `startDate` is available (e.g. previewing a template that has no
 * instance yet), the token is left as a bracketed placeholder instead of
 * silently substituting today's date.
 *
 * Accepts an optional offset, e.g. `{{startDate+3d}}`, `{{startDate-2w}}`.
 * Units: d = days, w = weeks, m = months, y = years.
 */
export function resolveDescriptionTemplate(
  description: string,
  context: DescriptionTemplateContext = {}
): string {
  return description.replace(
    DATE_TOKEN_PATTERN,
    (_match, sign?: string, amount?: string, unit?: string) => {
      const offsetLabel =
        sign && amount && unit ? `${sign}${amount}${unit}` : '';

      if (context.startDate === undefined) {
        return offsetLabel ? `[start date ${offsetLabel}]` : '[start date]';
      }

      const date = moment.unix(context.startDate);
      if (sign && amount && unit) {
        const offset = Number(amount) * (sign === '-' ? -1 : 1);
        date.add(offset, UNIT_BY_LETTER[unit.toLowerCase()]);
      }

      return date.format('MMM D, YYYY');
    }
  );
}

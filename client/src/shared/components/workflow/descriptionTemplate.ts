import moment from 'moment';

const DATE_TOKEN_PATTERN =
  /\{\{\s*(today|startDate)\s*(?:([+-])\s*(\d+)\s*(d|w|m|y)\s*)?\}\}/gi;

const UNIT_BY_LETTER: Record<string, moment.unitOfTime.DurationConstructor> = {
  d: 'days',
  w: 'weeks',
  m: 'months',
  y: 'years',
};

export type DescriptionTemplateContext = {
  /** Epoch seconds the step actually started, for the `{{startDate...}}` anchor. */
  startDate?: number;
};

/**
 * Resolves computed date placeholders in a step description into formatted
 * date strings.
 *
 * Two anchors are supported:
 * - '{{today...}}' is evaluated relative to the moment the description is
 *   rendered, so it drifts every time the step is viewed on a later day.
 * - '{{startDate...}}' is evaluated relative to 'context.startDate', so it
 *   stays fixed once the step has actually started. If no 'startDate' is
 *   available (e.g. previewing a template that has no instance yet), the
 *   token is left as a bracketed placeholder instead of silently falling
 *   back to "today".
 *
 * Both anchors accept an optional offset, e.g. '{{today+3d}}',
 * '{{startDate-2w}}'. Units: d = days, w = weeks, m = months, y = years.
 */
export function resolveDescriptionTemplate(
  description: string,
  context: DescriptionTemplateContext = {}
): string {
  return description.replace(
    DATE_TOKEN_PATTERN,
    (_match, anchor: string, sign?: string, amount?: string, unit?: string) => {
      const offsetLabel =
        sign && amount && unit ? `${sign}${amount}${unit}` : '';

      let date: moment.Moment;
      if (anchor.toLowerCase() === 'startdate') {
        if (context.startDate === undefined) {
          return offsetLabel ? `[start date ${offsetLabel}]` : '[start date]';
        }
        date = moment.unix(context.startDate);
      } else {
        date = moment();
      }

      if (sign && amount && unit) {
        const offset = Number(amount) * (sign === '-' ? -1 : 1);
        date.add(offset, UNIT_BY_LETTER[unit.toLowerCase()]);
      }

      return date.format('MMM D, YYYY');
    }
  );
}

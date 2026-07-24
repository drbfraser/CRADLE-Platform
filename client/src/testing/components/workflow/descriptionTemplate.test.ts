import { describe, it, expect } from 'vitest';
import moment from 'moment';
import { resolveDescriptionTemplate } from 'src/shared/components/workflow/descriptionTemplate';

describe('resolveDescriptionTemplate', () => {
  it('leaves plain text unchanged', () => {
    expect(resolveDescriptionTemplate('No placeholders here.')).toBe(
      'No placeholders here.'
    );
  });

  it('resolves {{startDate+3d}} to a date 3 days after the given start date', () => {
    const startDate = moment('2050-08-20T00:00:00Z').unix();
    const result = resolveDescriptionTemplate(
      'Recommend patient come back in 3 days ({{startDate+3d}}).',
      { startDate }
    );
    expect(result).toBe(
      `Recommend patient come back in 3 days (${moment
        .unix(startDate)
        .add(3, 'days')
        .format('MMM D, YYYY')}).`
    );
  });

  it('resolves {{startDate-2w}} to a date 2 weeks before the given start date', () => {
    const startDate = moment('2050-08-20T00:00:00Z').unix();
    const result = resolveDescriptionTemplate('Started {{startDate-2w}}.', {
      startDate,
    });
    expect(result).toBe(
      `Started ${moment.unix(startDate).subtract(2, 'weeks').format('MMM D, YYYY')}.`
    );
  });

  it('resolves {{startDate}} to the start date itself', () => {
    const startDate = moment('2050-08-20T00:00:00Z').unix();
    expect(
      resolveDescriptionTemplate('Started {{startDate}}.', { startDate })
    ).toBe(`Started ${moment.unix(startDate).format('MMM D, YYYY')}.`);
  });

  it('resolves multiple placeholders independently', () => {
    const startDate = moment('2050-08-20T00:00:00Z').unix();
    const result = resolveDescriptionTemplate(
      '{{startDate}} and {{startDate+1m}}',
      { startDate }
    );
    expect(result).toBe(
      `${moment.unix(startDate).format('MMM D, YYYY')} and ${moment
        .unix(startDate)
        .add(1, 'months')
        .format('MMM D, YYYY')}`
    );
  });

  it('leaves {{startDate...}} as a bracketed placeholder when no start date is available', () => {
    expect(resolveDescriptionTemplate('Come back on {{startDate+3d}}.')).toBe(
      'Come back on [start date +3d].'
    );
    expect(resolveDescriptionTemplate('Started {{startDate}}.')).toBe(
      'Started [start date].'
    );
  });

  it('no longer treats {{today}} as a special token', () => {
    expect(resolveDescriptionTemplate('Today is {{today}}.')).toBe(
      'Today is {{today}}.'
    );
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import moment from 'moment';
import { resolveDescriptionTemplate } from 'src/shared/components/workflow/descriptionTemplate';

describe('resolveDescriptionTemplate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-08-27T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('leaves plain text unchanged', () => {
    expect(resolveDescriptionTemplate('No placeholders here.')).toBe(
      'No placeholders here.'
    );
  });

  it('resolves {{today}} to the current date', () => {
    expect(resolveDescriptionTemplate('Today is {{today}}.')).toBe(
      `Today is ${moment().format('MMM D, YYYY')}.`
    );
  });

  it('resolves {{today+3d}} to a date 3 days in the future', () => {
    const result = resolveDescriptionTemplate(
      'Recommend patient come back in 3 days ({{today+3d}}).'
    );
    expect(result).toBe(
      `Recommend patient come back in 3 days (${moment()
        .add(3, 'days')
        .format('MMM D, YYYY')}).`
    );
  });

  it('resolves {{today-2w}} to a date 2 weeks in the past', () => {
    const result = resolveDescriptionTemplate('Started {{today-2w}}.');
    expect(result).toBe(
      `Started ${moment().subtract(2, 'weeks').format('MMM D, YYYY')}.`
    );
  });

  it('resolves multiple placeholders independently', () => {
    const result = resolveDescriptionTemplate('{{today}} and {{today+1m}}');
    expect(result).toBe(
      `${moment().format('MMM D, YYYY')} and ${moment()
        .add(1, 'months')
        .format('MMM D, YYYY')}`
    );
  });

  it('resolves {{startDate+3d}} relative to the given start date, not today', () => {
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
    // fixed system time is 2050-08-27, well after the computed date, proving
    // the result tracks startDate rather than drifting with "today"
    expect(result).not.toContain(moment().format('MMM D, YYYY'));
  });

  it('resolves {{startDate}} to the start date itself', () => {
    const startDate = moment('2050-08-20T00:00:00Z').unix();
    expect(
      resolveDescriptionTemplate('Started {{startDate}}.', { startDate })
    ).toBe(`Started ${moment.unix(startDate).format('MMM D, YYYY')}.`);
  });

  it('leaves {{startDate...}} as a bracketed placeholder when no start date is available', () => {
    expect(resolveDescriptionTemplate('Come back on {{startDate+3d}}.')).toBe(
      'Come back on [start date +3d].'
    );
    expect(resolveDescriptionTemplate('Started {{startDate}}.')).toBe(
      'Started [start date].'
    );
  });
});

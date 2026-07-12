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
});

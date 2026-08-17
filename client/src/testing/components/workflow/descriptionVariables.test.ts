import { describe, it, expect } from 'vitest';
import moment from 'moment';
import {
  extractVariableTags,
  resolveDescriptionVariables,
} from 'src/shared/components/workflow/descriptionVariables';
import { DescriptionVariableResolution } from 'src/shared/api/modules/workflowInstance';

describe('extractVariableTags', () => {
  it('returns an empty list when there are no tokens', () => {
    expect(extractVariableTags('No placeholders here.')).toEqual([]);
  });

  it('extracts a single variable tag', () => {
    expect(extractVariableTags('Patient age: {{patient.age}}.')).toEqual([
      'patient.age',
    ]);
  });

  it('excludes {{startDate...}} tokens (handled separately)', () => {
    expect(
      extractVariableTags('Started {{startDate+3d}}, age {{patient.age}}.')
    ).toEqual(['patient.age']);
  });

  it('deduplicates repeated tags', () => {
    expect(
      extractVariableTags('{{patient.age}} and again {{patient.age}}')
    ).toEqual(['patient.age']);
  });

  it('extracts multiple distinct tags', () => {
    expect(
      extractVariableTags(
        '{{patient.age}} / {{pregnancies[latest].start_date}}'
      )
    ).toEqual(['patient.age', 'pregnancies[latest].start_date']);
  });
});

describe('resolveDescriptionVariables', () => {
  it('substitutes a resolved value', () => {
    const resolutions: DescriptionVariableResolution[] = [
      { var: 'patient.age', value: 34, status: 'RESOLVED' },
    ];
    expect(
      resolveDescriptionVariables('Patient is {{patient.age}}.', resolutions)
    ).toBe('Patient is 34.');
  });

  it('leaves a friendly placeholder when nothing was resolved for the tag', () => {
    expect(
      resolveDescriptionVariables('Patient is {{patient.age}}.', [])
    ).toBe('Patient is (patient age not loaded).');
  });

  it('shows a distinct placeholder for not-yet-implemented data sources', () => {
    const resolutions: DescriptionVariableResolution[] = [
      {
        var: 'referrals[latest].date_referred',
        status: 'NOT_IMPLEMENTED',
      },
    ];
    expect(
      resolveDescriptionVariables(
        'Referred on {{referrals[latest].date_referred}}.',
        resolutions
      )
    ).toBe(
      'Referred on (referrals[latest].date_referred not yet available).'
    );
  });

  it('leaves a friendly placeholder for NO_DATA and INVALID_VARIABLE', () => {
    const resolutions: DescriptionVariableResolution[] = [
      { var: 'patient.age', status: 'NO_DATA' },
      { var: 'not.a.real.var', status: 'INVALID_VARIABLE' },
    ];
    expect(
      resolveDescriptionVariables(
        '{{patient.age}} / {{not.a.real.var}}',
        resolutions
      )
    ).toBe('(patient age doesn\'t exist) / (unrecognized variable: not.a.real.var)');
  });

  it('does not touch {{startDate...}} tokens', () => {
    expect(
      resolveDescriptionVariables('Started {{startDate+3d}}.', [])
    ).toBe('Started {{startDate+3d}}.');
  });

  it('formats pregnancy start/end dates as calendar dates, not raw epoch numbers', () => {
    const epoch = moment('2050-03-03T00:00:00Z').unix();
    const resolutions: DescriptionVariableResolution[] = [
      {
        var: 'pregnancies[latest].start_date',
        value: epoch,
        status: 'RESOLVED',
      },
      {
        var: 'pregnancies[latest].end_date',
        value: epoch,
        status: 'RESOLVED',
      },
    ];
    const result = resolveDescriptionVariables(
      'Started {{pregnancies[latest].start_date}}, ended {{pregnancies[latest].end_date}}.',
      resolutions
    );
    const formatted = moment.unix(epoch).format('MMM D, YYYY');
    expect(result).toBe(`Started ${formatted}, ended ${formatted}.`);
  });

  it('leaves a friendly placeholder for an ongoing pregnancy (end_date is null)', () => {
    const resolutions: DescriptionVariableResolution[] = [
      { var: 'pregnancies[latest].end_date', value: null, status: 'RESOLVED' },
    ];
    expect(
      resolveDescriptionVariables(
        'Ended {{pregnancies[latest].end_date}}.',
        resolutions
      )
    ).toBe("Ended (pregnancy end date doesn't exist).");
  });

  it('does not date-format unrelated numeric variables', () => {
    const resolutions: DescriptionVariableResolution[] = [
      { var: 'patient.age', value: 34, status: 'RESOLVED' },
    ];
    expect(
      resolveDescriptionVariables('Age: {{patient.age}}.', resolutions)
    ).toBe('Age: 34.');
  });

  it('formats booleans as Yes/No instead of true/false', () => {
    const resolutions: DescriptionVariableResolution[] = [
      {
        var: 'vitals[latest].is_flagged_for_follow_up',
        value: true,
        status: 'RESOLVED',
      },
      { var: 'patient.is_pregnant', value: false, status: 'RESOLVED' },
    ];
    expect(
      resolveDescriptionVariables(
        'Flagged: {{vitals[latest].is_flagged_for_follow_up}}. Pregnant: {{patient.is_pregnant}}.',
        resolutions
      )
    ).toBe('Flagged: Yes. Pregnant: No.');
  });

  it('falls back to the raw tag when there is no friendly label for it', () => {
    const resolutions: DescriptionVariableResolution[] = [
      { var: 'patient.zone', status: 'NO_DATA' },
    ];
    expect(
      resolveDescriptionVariables('Zone: {{patient.zone}}.', resolutions)
    ).toBe("Zone: (patient.zone doesn't exist).");
  });
});

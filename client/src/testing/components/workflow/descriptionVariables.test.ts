import { describe, it, expect } from 'vitest';
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

  it('leaves a bracketed placeholder when nothing was resolved for the tag', () => {
    expect(
      resolveDescriptionVariables('Patient is {{patient.age}}.', [])
    ).toBe('Patient is [patient.age].');
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
    ).toBe('Referred on [referrals[latest].date_referred — not yet available].');
  });

  it('leaves a bracketed placeholder for NO_DATA and INVALID_VARIABLE', () => {
    const resolutions: DescriptionVariableResolution[] = [
      { var: 'patient.zone', status: 'NO_DATA' },
      { var: 'not.a.real.var', status: 'INVALID_VARIABLE' },
    ];
    expect(
      resolveDescriptionVariables(
        '{{patient.zone}} / {{not.a.real.var}}',
        resolutions
      )
    ).toBe('[patient.zone] / [not.a.real.var]');
  });

  it('does not touch {{startDate...}} tokens', () => {
    expect(
      resolveDescriptionVariables('Started {{startDate+3d}}.', [])
    ).toBe('Started {{startDate+3d}}.');
  });
});

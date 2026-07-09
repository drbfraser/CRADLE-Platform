import { OrganizedRecords, FlattenedRecord } from 'src/shared/types/types';

const getRecordTimestamp = (record: Record<string, unknown>) => {
  return (
    ('dateTaken' in record && record.dateTaken) ||
    ('dateReferred' in record && record.dateReferred) ||
    ('dateAssessed' in record && record.dateAssessed) ||
    ('dateSubmitted' in record && record.dateSubmitted) ||
    0
  );
};

export const flattenAndSortRecords = (
  organizedRecords: OrganizedRecords
): FlattenedRecord[] =>
  [
    ...organizedRecords.readings.map((r) => ({
      ...r,
      type: 'reading' as const,
    })),
    ...organizedRecords.referrals.map((r) => ({
      ...r,
      type: 'referral' as const,
    })),
    ...organizedRecords.assessments.map((r) => ({
      ...r,
      type: 'assessment' as const,
    })),
    ...organizedRecords.forms.map((r) => ({ ...r, type: 'form' as const })),
  ].sort(
    (a, b) =>
      Number(getRecordTimestamp(b as Record<string, unknown>)) -
      Number(getRecordTimestamp(a as Record<string, unknown>))
  );

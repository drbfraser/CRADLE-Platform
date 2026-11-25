import { describe, it, expect } from 'vitest';
import { formatPatientNumber } from 'src/shared/utils/format';
import { initialState, PatientField } from 'src/pages/patientForm/state';
import { personalInfoValidationSchema } from 'src/pages/patientForm/components/personalInfo/validation';

const validPatient = {
  ...initialState,
  [PatientField.patientNumber]: '49300028162',
  [PatientField.patientName]: 'Jane',
  [PatientField.dateOfBirth]: '1990-05-30',
};

const patientNumberError = async (patientNumber: string) => {
  try {
    await personalInfoValidationSchema.validateAt(PatientField.patientNumber, {
      ...validPatient,
      [PatientField.patientNumber]: patientNumber,
    });
    return null;
  } catch (e) {
    return (e as Error).message;
  }
};

describe('formatPatientNumber', () => {
  it('shows the patient number', () => {
    expect(formatPatientNumber('49300028162')).toBe('49300028162');
  });

  it('shows a dash when there is no patient number', () => {
    expect(formatPatientNumber(null)).toBe('—');
    expect(formatPatientNumber('')).toBe('—');
  });
});

describe('patient number field', () => {
  it('is required', async () => {
    expect(await patientNumberError('')).toMatch(/required/);
    expect(await patientNumberError('   ')).toMatch(/required/);
  });

  it('allows up to 50 characters', async () => {
    expect(await patientNumberError('a'.repeat(50))).toBeNull();
    expect(await patientNumberError('a'.repeat(51))).not.toBeNull();
  });
});

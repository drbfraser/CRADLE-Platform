import { Patient, Reading } from "../../../../../../types";

export const getReferralIds = (selectedPatient: Patient): Array<string> =>
  selectedPatient.readings
    .filter((reading: Reading): boolean => reading.referral !== null)
    .map(({ referral }: Reading): string => referral);
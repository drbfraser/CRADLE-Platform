import { Patient, Reading } from '@types';

export const getReferralIds = ({ readings }: Patient): Array<number> => {
  return readings
    .map(({ referral }: Reading): number => {
      return referral ?? -1;
    })
    .filter((referral: number): boolean => referral !== -1);
};

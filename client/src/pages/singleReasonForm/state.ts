// import * as Yup from 'yup';

// field names here match POST /api/referrals
export enum SingleReasonField {
  comment = 'comment',
}

export const initialState = {
  [SingleReasonField.comment]: '',
};

export type SingleReason = typeof initialState;

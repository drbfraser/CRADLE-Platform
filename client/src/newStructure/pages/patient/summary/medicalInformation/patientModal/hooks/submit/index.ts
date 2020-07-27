import { Callback, EditedPatient, OrUndefined } from '@types';
import {
  getTimestampFromMonths,
  getTimestampFromWeeks,
} from '../../../../../../../shared/utils';
import {
  resetPatientUpdated,
  updatePatient,
} from '../../../../../../../shared/reducers/patients';

import { GestationalAgeUnitEnum } from '../../../../../../../enums';
import React from 'react';
import { useDispatch } from 'react-redux';

interface IArgs {
  displayPatientModal: boolean;
  editedPatient: EditedPatient;
}

export const useSubmit = ({
  displayPatientModal,
  editedPatient,
}: IArgs): Callback<React.FormEvent<HTMLFormElement>> => {
  const dispatch = useDispatch();

  return (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!displayPatientModal) {
      // * Do not submit if the modal is closed
      return;
    }

    // * Reset patient updated to allow new reading to be shown
    // * without requiring a page refresh
    dispatch(resetPatientUpdated());

    const { patientId, gestationalAgeValue, ...patientData } = editedPatient;
    let gestationalTimestamp: OrUndefined<number>;

    if (editedPatient.isPregnant) {
      gestationalTimestamp =
        editedPatient.gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
          ? getTimestampFromWeeks(gestationalAgeValue)
          : getTimestampFromMonths(gestationalAgeValue);
    }

    dispatch(
      updatePatient(patientId, { ...patientData, gestationalTimestamp })
    );
  };
};

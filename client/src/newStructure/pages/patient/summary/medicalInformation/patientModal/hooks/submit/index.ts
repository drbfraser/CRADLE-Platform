import { Callback, EditedPatient } from '@types';

import React from 'react';
import { resetPatientUpdated } from '../../../../../../../redux/reducers/patients';
import { useDispatch } from 'react-redux';

interface IArgs {
  displayPatientModal: boolean;
  editedPatient: EditedPatient;
}

export const useSubmit = ({
  displayPatientModal,
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

    // const { patientId, gestationalTimestamp, ...patientData } = editedPatient;

    // dispatch(
    //   updatePatient(patientId, {
    //     ...patientData,
    //     gestationalTimestamp: editedPatient.isPregnant
    //       ? gestationalTimestamp
    //       : undefined,
    //   })
    // );
  };
};

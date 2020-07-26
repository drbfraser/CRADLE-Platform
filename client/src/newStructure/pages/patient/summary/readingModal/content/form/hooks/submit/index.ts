import { Callback, NewReading, OrUndefined, Patient } from '@types';
import { useDispatch, useSelector } from 'react-redux';

import { ReduxState } from '../../../../../../../../redux/rootReducer';
import { SymptomEnum } from '../../../../../../../../enums';
import { createReading } from '../../../../../../../../shared/reducers/reading';
import { formatSymptoms } from './utils';
import { v4 as makeUniqueId } from 'uuid';

interface IArgs {
  hasUrineTest: boolean;
  newReading: NewReading;
  otherSymptoms: string;
  selectedSymptoms: Record<SymptomEnum, boolean>;
  selectedPatient: Patient;
  setError: Callback<string>;
}

export const useSubmit = ({
  hasUrineTest,
  newReading,
  otherSymptoms,
  selectedSymptoms,
  selectedPatient,
  setError,
}: IArgs): Callback<React.FormEvent<HTMLFormElement>> => {
  const userId = useSelector(
    ({ user }: ReduxState): OrUndefined<number> => user.current.data?.userId
  );

  const dispatch = useDispatch();

  return (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!userId) {
      setError(
        `You are currently not logged in. You can only perform this action if logged in!`
      );
      return;
    }

    // * Generate random id as reading id
    const readingId = makeUniqueId();

    // * Generate reading date as current time
    const dateTimeTaken = Math.floor(Date.now() / 1000);

    // * Remove unnecessary fields from selectedPatient
    delete selectedPatient.readings;
    delete selectedPatient.needsAssessment;
    delete selectedPatient.tableData;

    if (!hasUrineTest) {
      delete newReading.urineTests;
    }

    dispatch(
      createReading({
        patient: { ...selectedPatient },
        reading: {
          ...newReading,
          userId,
          readingId,
          dateTimeTaken,
          symptoms: formatSymptoms(selectedSymptoms, otherSymptoms),
          dateRecheckVitalsNeeded: null,
        },
      })
    );

    // TODO: Upon successsful new reading addition
    // TODO: Display success message
    // TODO: Calculate traffic light for new reading (Use calculate shock index in utils)
    // TODO: Update traffic light for new reading
    // TODO: Update patient with new reading
  };
};

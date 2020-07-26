import { Action, actionCreators } from '../../../../../reducers';
import { Callback, NewReading, OrNull, OrUndefined, Patient } from '@types';
import React, { Dispatch } from 'react';
import {
  ReadingCreatedResponse,
  createReading,
} from '../../../../../../../../shared/reducers/reading';
import {
  afterNewReadingAdded,
  resetPatientUpdated,
} from '../../../../../../../../shared/reducers/patients';
import { useDispatch, useSelector } from 'react-redux';

import { ReduxState } from '../../../../../../../../redux/rootReducer';
import { SymptomEnum } from '../../../../../../../../enums';
import { formatSymptoms } from './utils';
import { makeUniqueId } from '../../../../../../../../shared/utils';

interface IArgs {
  hasUrineTest: boolean;
  newReading: NewReading;
  otherSymptoms: string;
  selectedSymptoms: Record<SymptomEnum, boolean>;
  selectedPatient: Patient;
  setError: Callback<string>;
  updateState: Dispatch<Action>;
}

type SelectorState = {
  readingCreatedResponse: OrNull<ReadingCreatedResponse>;
  userId: OrUndefined<number>;
};

export const useSubmit = ({
  hasUrineTest,
  newReading,
  otherSymptoms,
  selectedSymptoms,
  selectedPatient,
  setError,
  updateState,
}: IArgs): Callback<React.FormEvent<HTMLFormElement>> => {
  const { readingCreatedResponse, userId } = useSelector(
    ({ reading, user }: ReduxState): SelectorState => ({
      readingCreatedResponse: reading.readingCreatedResponse,
      userId: user.current.data?.userId,
    })
  );

  const dispatch = useDispatch();

  React.useEffect((): void => {
    if (readingCreatedResponse) {
      dispatch(afterNewReadingAdded(readingCreatedResponse.reading));
    }
  }, [dispatch, readingCreatedResponse]);

  return (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!userId) {
      setError(
        `You are currently not logged in. You can only perform this action if logged in!`
      );
      return;
    }

    // * Reset patient updated to allow new reading to be shown
    // * without requiring a page refresh
    dispatch(resetPatientUpdated());

    // * Generate random id as reading id
    const readingId = makeUniqueId();

    // * Generate reading date as current time
    const dateTimeTaken = Math.floor(Date.now() / 1000);

    // * Remove unnecessary fields from selectedPatient
    const patientData = Object.entries(selectedPatient).reduce(
      (data: Record<string, any>, [key, value]: [string, any]): any => {
        if (
          key === `readings` ||
          key === `needsAssessment` ||
          key === `tableData`
        ) {
          return data;
        }

        data[key] = value;
        return data;
      },
      {}
    );

    // * Remove unnecessary fields from newReading
    const { urineTests, ...readingData } = newReading;

    if (!hasUrineTest) {
      delete newReading.urineTests;
    }

    dispatch(
      createReading({
        patient: {
          ...patientData,
        },
        reading: {
          ...readingData,
          urineTests: hasUrineTest ? urineTests : undefined,
          userId,
          readingId,
          dateTimeTaken,
          symptoms: formatSymptoms(selectedSymptoms, otherSymptoms),
          dateRecheckVitalsNeeded: null,
        },
      })
    );

    updateState(actionCreators.reset());
  };
};

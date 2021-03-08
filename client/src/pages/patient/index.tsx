import { OrNull, Patient } from 'src/types';
import { clearGetPatientError, getPatient } from 'src/redux/reducers/patients';
import { useDispatch, useSelector } from 'react-redux';

import { Loader } from 'src/shared/components/loader';
import { PatientSummary } from './summary';
import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { RouteComponentProps } from 'react-router-dom';
import { Toast } from 'src/shared/components/toast';

type SelectorState = {
  error: OrNull<string>;
  loading: boolean;
  patient: OrNull<Patient>;
};

type Params = {
  id: string;
};

export const PatientPage: React.FC<RouteComponentProps<Params>> = ({
  match: {
    params: { id },
  },
}) => {
  const { error, loading, patient } = useSelector(
    ({ patients }: ReduxState): SelectorState => {
      return {
        error: patients.error,
        loading: patients.isLoading,
        patient: patients.patient,
      };
    }
  );
  const dispatch = useDispatch();

  React.useEffect((): void => {
    if (id) {
      dispatch(getPatient(id));
    }
  }, [dispatch, id]);

  if (loading || !patient) {
    return <Loader message="Getting patient information..." show={true} />;
  }

  const clearError = (): void => {
    dispatch(clearGetPatientError());
  };

  return (
    <>
      <Toast status="error" message={error} clearMessage={clearError} />
      <PatientSummary selectedPatient={patient} />
    </>
  );
};

import { OrNull, Patient } from '@types';
import {
  clearCurrentUserError,
  getCurrentUser,
} from '../../shared/reducers/user/currentUser';
import {
  clearGetPatientsError,
  getPatients,
} from '../../shared/reducers/patients';
import { useDispatch, useSelector } from 'react-redux';

import { Error } from '../../shared/components/error';
import React from 'react';
import { ReduxState } from '../../redux/rootReducer';
import { ReferralTable } from './referralTable';
import { getPatientsWithReferrals } from './utils';
import { push } from 'connected-react-router';

type SelectorState = {
  allPatients: OrNull<Array<Patient>>;
  gettingAllPatients: boolean;
  gettingAllPatientsError: OrNull<string>;
  loggingIn: boolean;
  loggingInError: OrNull<string>;
  loggedIn: boolean;
  preventFetch: boolean;
};

export const ReferralsPage: React.FC = () => {
  const [patients, setPatients] = React.useState<Array<Patient>>([]);
  const {
    allPatients,
    gettingAllPatients,
    gettingAllPatientsError,
    loggingIn,
    loggingInError,
    loggedIn,
    preventFetch,
  } = useSelector(
    (state: ReduxState): SelectorState => ({
      allPatients: state.patients.patientsList,
      gettingAllPatients: state.patients.isLoading,
      gettingAllPatientsError: state.patients.error,
      loggingIn: state.user.current.loading,
      loggingInError: state.user.current.message,
      loggedIn: state.user.current.loggedIn,
      preventFetch: state.patients.preventFetch,
    })
  );
  const dispatch = useDispatch();

  React.useEffect((): void => {
    if (!loggingIn && !loggingInError && !loggedIn) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, loggingIn, loggingInError, loggedIn]);

  React.useEffect((): void => {
    if (
      !preventFetch &&
      !gettingAllPatients &&
      !gettingAllPatientsError &&
      (allPatients?.length === 0 || allPatients === null)
    ) {
      dispatch(getPatients());
    }
  }, [
    allPatients,
    gettingAllPatients,
    gettingAllPatientsError,
    dispatch,
    preventFetch,
  ]);

  React.useEffect((): void => {
    setPatients(getPatientsWithReferrals(allPatients));
  }, [allPatients]);

  const clearError = (): void => {
    if (gettingAllPatientsError) {
      dispatch(clearGetPatientsError());
    }

    if (loggingInError) {
      dispatch(clearCurrentUserError());
    }
  };

  const goToPatientPage = (selectedPatient: { patientId: string }): void => {
    dispatch(push(`/patient/${selectedPatient.patientId}`));
  };

  return (
    <>
      <Error
        error={loggingInError || gettingAllPatientsError}
        clearError={clearError}
      />
      <ReferralTable
        callbackFromParent={goToPatientPage}
        data={patients}
        isLoading={gettingAllPatients}
      />
    </>
  );
};

import { OrNull, Patient } from '@types';
import {
  clearCurrentUserError,
  getCurrentUser,
} from '../../shared/reducers/user/currentUser';
import {
  clearGetReferralsTablePatientsError,
  getReferralsTablePatients,
  sortReferralsTablePatients,
  updateReferralsTablePageNumber,
  updateReferralsTableSearchText,
} from '../../shared/reducers/patients';
import { useDispatch, useSelector } from 'react-redux';

import { Error } from '../../shared/components/error';
import React from 'react';
import { ReduxState } from '../../redux/rootReducer';
import { ReferralTable } from './referralTable';
import { push } from 'connected-react-router';

type SelectorState = {
  patients: OrNull<Array<Patient>>;
  gettingPatients: boolean;
  gettingPatientsError: OrNull<string>;
  loggingIn: boolean;
  loggingInError: OrNull<string>;
  loggedIn: boolean;
  pageNumber: number;
  preventFetch: boolean;
  searchText?: string;
};

export const ReferralsPage: React.FC = () => {
  const {
    patients,
    gettingPatients,
    gettingPatientsError,
    loggingIn,
    loggingInError,
    loggedIn,
    pageNumber,
    preventFetch,
    searchText,
  } = useSelector(
    (state: ReduxState): SelectorState => ({
      patients: state.patients.referralsTablePatientsList,
      gettingPatients: state.patients.isLoading,
      gettingPatientsError: state.patients.error,
      loggingIn: state.user.current.loading,
      loggingInError: state.user.current.message,
      loggedIn: state.user.current.loggedIn,
      pageNumber: state.patients.referralsTablePageNumber,
      preventFetch: state.patients.preventFetch,
      searchText: state.patients.referralsTableSearchText,
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
      !gettingPatients &&
      !gettingPatientsError &&
      (patients?.length === 0 || patients === null)
    ) {
      dispatch(getReferralsTablePatients());
    }
  }, [patients, gettingPatients, gettingPatientsError, dispatch, preventFetch]);

  const clearError = (): void => {
    if (gettingPatientsError) {
      dispatch(clearGetReferralsTablePatientsError());
    }

    if (loggingInError) {
      dispatch(clearCurrentUserError());
    }
  };

  const goToPatientPage = (selectedPatient: { patientId: string }): void => {
    dispatch(push(`/patient/${selectedPatient.patientId}`));
  };

  const updatePageNumber = (pageNumber: number): void => {
    dispatch(updateReferralsTablePageNumber(pageNumber));
  };

  const updateSearchText = (searchText?: string): void => {
    dispatch(updateReferralsTableSearchText(searchText));
  };

  const sortPatients = (sortedPatients: Array<Patient>): void => {
    dispatch(sortReferralsTablePatients(sortedPatients));
  };

  return (
    <>
      <Error
        error={loggingInError || gettingPatientsError}
        clearError={clearError}
      />
      <ReferralTable
        pageNumber={pageNumber}
        searchText={searchText}
        onPatientSelected={goToPatientPage}
        data={patients}
        loading={gettingPatients}
        updatePageNumber={updatePageNumber}
        updateSearchText={updateSearchText}
        sortPatients={sortPatients}
      />
    </>
  );
};

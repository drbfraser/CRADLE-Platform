import { OrNull, Patient } from '@types';
import {
  clearGetReferralsTablePatientsError,
  getReferralsTablePatients,
  sortReferralsTablePatients,
  updateReferralsTablePageNumber,
  updateReferralsTableSearchText,
  updateTableDataOnSelectedPatientChange,
} from '../../redux/reducers/patients';
import { useDispatch, useSelector } from 'react-redux';

import React from 'react';
import { ReduxState } from '../../redux/reducers';
import { ReferralTable } from './referralTable';
import { Toast } from '../../shared/components/toast';
import { push } from 'connected-react-router';

type SelectorState = {
  selectedPatient: OrNull<Patient>;
  patients: OrNull<Array<Patient>>;
  fetchingPatients: boolean;
  gettingPatientsError: OrNull<string>;
  pageNumber: number;
  preventFetch: boolean;
  searchText?: string;
};

export const ReferralsPage: React.FC = () => {
  const {
    selectedPatient,
    patients,
    fetchingPatients,
    gettingPatientsError,
    pageNumber,
    preventFetch,
    searchText,
  } = useSelector(
    (state: ReduxState): SelectorState => ({
      selectedPatient: state.patients.patient,
      patients: state.patients.referralsTablePatientsList,
      fetchingPatients: state.patients.isLoading,
      gettingPatientsError: state.patients.error,
      pageNumber: state.patients.referralsTablePageNumber,
      preventFetch: state.patients.preventFetch,
      searchText: state.patients.referralsTableSearchText,
    })
  );

  const dispatch = useDispatch();

  React.useEffect((): void => {
    if (
      !preventFetch &&
      !fetchingPatients &&
      !gettingPatientsError &&
      patients === null
    ) {
      dispatch(getReferralsTablePatients());
    }
  }, [
    patients,
    fetchingPatients,
    gettingPatientsError,
    dispatch,
    preventFetch,
  ]);

  React.useEffect((): void => {
    dispatch(updateTableDataOnSelectedPatientChange());
  }, [dispatch, selectedPatient]);

  const clearError = (): void => {
    dispatch(clearGetReferralsTablePatientsError());
  };

  const goToPatientPage = (selectedPatient: { patientId: string }): void => {
    dispatch(push(`/patients/${selectedPatient.patientId}`));
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
      <Toast
        status="error"
        message={gettingPatientsError}
        clearMessage={clearError}
      />
      <ReferralTable
        pageNumber={pageNumber}
        searchText={searchText}
        onPatientSelected={goToPatientPage}
        data={patients}
        loading={fetchingPatients}
        updatePageNumber={updatePageNumber}
        updateSearchText={updateSearchText}
        sortPatients={sortPatients}
      />
    </>
  );
};

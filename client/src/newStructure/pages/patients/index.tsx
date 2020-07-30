import { GlobalSearchPatient, OrNull, Patient } from '@types';
import {
  addPatientToHealthFacility,
  clearAddPatientToHealthFacilityError,
  getPatientsTablePatients,
  updatePatientsTablePageNumber,
  updatePatientsTableSearchText,
} from '../../redux/reducers/patients';
import { useDispatch, useSelector } from 'react-redux';

import { PatientTable } from './patientTable';
import React from 'react';
import { ReduxState } from '../../redux/reducers';
import { RoleEnum } from '../../enums';
import { Toast } from '../../shared/components/toast';
import { push } from 'connected-react-router';

type SelectorState = {
  addingFromGlobalSearch: boolean;
  error: OrNull<string>;
  fetchingPatients: boolean;
  globalSearchPatients: OrNull<Array<GlobalSearchPatient>>;
  pageNumber: number;
  patients: OrNull<Array<Patient>>;
  patientsTableSearchText?: string;
  showReferredPatients?: boolean;
  userIsHealthWorker?: boolean;
};

export const PatientsPage: React.FC = () => {
  const {
    addingFromGlobalSearch,
    error,
    fetchingPatients,
    globalSearchPatients,
    pageNumber,
    patients,
    patientsTableSearchText,
    showReferredPatients,
    userIsHealthWorker,
  } = useSelector(
    ({ patients, user }: ReduxState): SelectorState => ({
      addingFromGlobalSearch: patients.addingFromGlobalSearch,
      error: patients.addingFromGlobalSearchError,
      fetchingPatients: patients.isLoading,
      globalSearchPatients: patients.globalSearchPatientsList,
      pageNumber: patients.patientsTablePageNumber,
      patients: patients.patientsList,
      patientsTableSearchText: patients.patientsTableSearchText,
      showReferredPatients: patients.showReferredPatients,
      userIsHealthWorker: user.current.data?.roles.includes(RoleEnum.HCW),
    })
  );
  const dispatch = useDispatch();

  const getPatients = React.useCallback(
    (searchText?: string): void => {
      dispatch(getPatientsTablePatients(searchText));
    },
    [dispatch]
  );

  React.useEffect(() => {
    if (!fetchingPatients && patients === null) {
      getPatients();
    }
  }, [fetchingPatients, getPatients, patients]);

  const onPatientSelected = ({ patientId }: Patient): void => {
    dispatch(push(`/patients/${patientId}`));
  };

  const onGlobalSearchPatientSelected = (patientId: string): void => {
    dispatch(addPatientToHealthFacility(patientId));
  };

  const updatePageNumber = (pageNumber: number): void => {
    dispatch(updatePatientsTablePageNumber(pageNumber));
  };

  const updateSearchText = (searchText?: string): void => {
    dispatch(updatePatientsTableSearchText(searchText));
  };

  const clearError = (): void => {
    dispatch(clearAddPatientToHealthFacilityError());
  };

  return (
    <>
      <Toast message={error} status="error" clearMessage={clearError} />
      <PatientTable
        pageNumber={pageNumber}
        searchText={patientsTableSearchText}
        showReferredPatients={showReferredPatients}
        onPatientSelected={onPatientSelected}
        onGlobalSearchPatientSelected={onGlobalSearchPatientSelected}
        data={patients}
        globalSearchData={globalSearchPatients}
        loading={fetchingPatients || addingFromGlobalSearch}
        showGlobalSearch={userIsHealthWorker}
        getPatients={getPatients}
        updatePageNumber={updatePageNumber}
        updateSearchText={updateSearchText}
      />
    </>
  );
};

import {
  getPatients,
  getPatientsRequested,
} from '../../shared/reducers/patients';

import { PatientTable } from './patientTable';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';
import { Patient } from "../../types";
import { useHistory } from 'react-router-dom';

export const PatientsPage: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const patients = useSelector(({ patients }: any): any => patients);
  const user = useSelector(({ user }: any): any => user);

  React.useEffect(() => {
    if (!user.isLoggedIn) {
      dispatch(getCurrentUser());
      return;
    }

    if (
      !patients.patientsList ||
      patients.patientsList.length === 0
    ) {
      dispatch(getPatientsRequested());
      dispatch(getPatients());
    }
  }, [dispatch, patients, user]);

  const patientCallback = (selectedPatient: Patient): void => 
    history.push(`/patient/${selectedPatient.patientId}`);

  // don't render page if user is not logged in
  if (!user.isLoggedIn) {
    return <div />;
  }

  return (
    <PatientTable
      callbackFromParent={patientCallback}
      data={patients.patientsList}
      isLoading={patients.isLoading}
    />
  );
};
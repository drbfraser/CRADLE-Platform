import { useEffect, useState } from 'react';

import { Patient } from 'src/shared/types';
import { getPatientAsync } from 'src/shared/api/api';

const usePatient = (patientId: string): [Patient | undefined, boolean] => {
  const [patient, setPatient] = useState<Patient>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const patient: Patient = await getPatientAsync(patientId);
        setPatient(patient);
      } catch (e) {
        setErrorLoading(true);
      }
    };

    loadPatient();
  }, [patientId]);

  return [patient, errorLoading];
};

export default usePatient;

import { useQuery } from '@tanstack/react-query';
import { getPatientAsync } from 'src/shared/api/api';

const usePatient = (patientId: string) => {
  const { data: patient, isError: errorLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatientAsync(patientId),
  });

  return { patient, errorLoading };
};

export default usePatient;

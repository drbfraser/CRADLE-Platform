import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';

export const handleBlurPatientId = (
  handleBlur: any,
  setExistingPatientId: (val: string | null) => void
) => {
  return (e: any) => {
    handleBlur(e);

    const patientId = e.target.value;
    if (patientId.length !== 0) {
      apiFetch(
        API_URL +
          EndpointEnum.PATIENTS +
          '/' +
          patientId +
          EndpointEnum.PATIENT_INFO
      )
        .then((resp) =>
          setExistingPatientId(resp.status === 200 ? patientId : null)
        )
        .catch(() => {
          setExistingPatientId(null);
        });
    } else {
      setExistingPatientId(null);
    }
  };
};

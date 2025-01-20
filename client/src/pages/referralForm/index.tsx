import { useParams } from 'react-router-dom';

import { FormContainer } from 'src/shared/components/layout/FormContainer';
import PatientHeader from 'src/shared/components/patientHeader/PatientHeader';
import usePatient from 'src/shared/hooks/patient';
import { ReferralForm } from './ReferralForm';

type RouteParams = {
  patientId: string;
};

export const ReferralFormPage = () => {
  const { patientId } = useParams() as RouteParams;
  const { patient } = usePatient(patientId);

  return (
    <FormContainer
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
      <PatientHeader title="New Referral" patient={patient} />
      <ReferralForm patientId={patientId} />
    </FormContainer>
  );
};

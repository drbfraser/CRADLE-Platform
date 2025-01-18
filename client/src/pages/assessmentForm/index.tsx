import { AssessmentState, getAssessmentState } from './state';
import { useEffect, useState } from 'react';

import { AssessmentForm } from './AssessmentForm';
import LinearProgress from '@mui/material/LinearProgress';
import { useParams } from 'react-router-dom';
import PatientHeader from 'src/shared/components/patientHeader/PatientHeader';
import usePatient from 'src/shared/hooks/patient';
import { FormContainer } from 'src/shared/components/layout/FormContainer';

type RouteParams = {
  patientId: string;
  assessmentId: string | undefined;
  referralId: string | undefined;
};

export const AssessmentFormPage = () => {
  const { patientId, assessmentId, referralId } = useParams() as RouteParams;
  const [patient] = usePatient(patientId);
  const [formInitialState, setFormInitialState] = useState<AssessmentState>();

  useEffect(() => {
    getAssessmentState(patientId, assessmentId).then(setFormInitialState);
  }, [patientId, assessmentId]);

  return (
    <FormContainer
      sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PatientHeader
        title={`${assessmentId !== undefined ? 'Update' : 'New'} Assessment`}
        patient={patient}
      />

      {formInitialState === undefined ? (
        <LinearProgress />
      ) : (
        <AssessmentForm
          initialState={formInitialState}
          patientId={patientId}
          assessmentId={assessmentId}
          referralId={referralId}
        />
      )}
    </FormContainer>
  );
};

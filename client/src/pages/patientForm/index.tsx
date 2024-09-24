import { PatientState, getPatientState } from './state';
import { useEffect, useState } from 'react';

import LinearProgress from '@mui/material/LinearProgress';
import { PatientForm } from './PatientForm';
import { useRouteMatch } from 'react-router-dom';
import { FormContainer } from 'src/shared/components/layout/FormContainer';

type RouteParams = {
  patientId: string | undefined;
  editId: string;
  universalRecordId: string | undefined;
};

export const PatientFormPage = () => {
  //universalRecordId stands for pregnancyId and medicalRecordId because they share the same route matching
  const { patientId, editId, universalRecordId } =
    useRouteMatch<RouteParams>().params;

  const [formInitialState, setFormInitialState] = useState<PatientState>();

  useEffect(() => {
    getPatientState(patientId, universalRecordId, editId).then((state) =>
      setFormInitialState(state)
    );
  }, [patientId, editId, universalRecordId]);

  return (
    <FormContainer>
      {formInitialState === undefined ? (
        <LinearProgress />
      ) : (
        <PatientForm
          initialState={formInitialState}
          patientId={patientId}
          pregnancyId={universalRecordId}
          creatingNew={patientId === undefined}
          creatingNewPregnancy={
            patientId !== undefined && universalRecordId === undefined
          }
          editId={editId}
          universalRecordId={universalRecordId}
        />
      )}
    </FormContainer>
  );
};

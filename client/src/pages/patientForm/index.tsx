import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LinearProgress from '@mui/material/LinearProgress';

import { FormContainer } from 'src/shared/components/layout/FormContainer';
import { NewPatientForm } from './components/NewPatientForm';
import NewPregnancyForm from './components/NewPregnancyForm';
import EditPregnancyForm from './components/EditPregnancyForm';
import EditPersonalInfoForm from './components/EditPersonalInfoForm';
import EditMedicalRecordForm from './components/EditMedicalRecordForm';
import NewMedicalRecordForm from './components/NewMedicalRecordForm';
import { PatientState, getPatientState } from './state';

type FormType =
  | 'newPatient'
  | 'editPatient'
  | 'newPregnancy'
  | 'editPregnancy'
  | 'editDrugHistory'
  | 'newDrugHistory'
  | 'editMedicalHistory'
  | 'newMedicalHistory';

const getFormType = (
  patientId: string | undefined,
  editId: string | undefined,
  universalRecordId: string | undefined
): FormType | undefined => {
  if (universalRecordId) {
    switch (editId) {
      case 'pregnancyInfo':
        return 'editPregnancy';
      case 'medicalHistory':
        return 'editMedicalHistory';
      case 'drugHistory':
        return 'editDrugHistory';
      default:
        console.warn(
          `unknown edit id ${editId} for record ${universalRecordId}`
        );
    }
  } else {
    switch (editId) {
      case 'medicalHistory':
        return 'newMedicalHistory';
      case 'drugHistory':
        return 'newDrugHistory';
      case 'personalInfo':
        return 'editPatient';
    }

    if (!patientId) {
      return 'newPatient';
    }
    if (patientId) {
      return 'newPregnancy';
    }
  }

  console.error('unknown patient form');
  return undefined;
};

type RouteParams = {
  patientId: string | undefined;
  editId: string;
  universalRecordId: string | undefined;
};

export const PatientFormPage = () => {
  // universalRecordId stands for pregnancyId and medicalRecordId because they share the same route matching
  const { patientId, editId, universalRecordId } = useParams() as RouteParams;

  const [formInitialState, setFormInitialState] = useState<PatientState>();

  useEffect(() => {
    getPatientState(patientId, universalRecordId, editId).then((state) =>
      setFormInitialState(state)
    );
  }, [patientId, editId, universalRecordId]);

  const formType = getFormType(patientId, editId, universalRecordId);
  let Form = null;
  switch (formType) {
    case 'editPatient':
      Form = (
        <EditPersonalInfoForm
          patientId={patientId!}
          initialState={formInitialState!}
        />
      );
      break;
    case 'editPregnancy':
      Form = (
        <EditPregnancyForm
          patientId={patientId!}
          pregnancyId={universalRecordId!}
          initialState={formInitialState!}
        />
      );
      break;
    case 'newPregnancy':
      Form = (
        <NewPregnancyForm
          patientId={patientId!}
          initialState={formInitialState!}
        />
      );
      break;
    case 'newMedicalHistory':
      Form = (
        <NewMedicalRecordForm
          isDrugHistory={false}
          patientId={patientId!}
          initialState={formInitialState!}
        />
      );
      break;
    case 'editMedicalHistory':
      Form = (
        <EditMedicalRecordForm
          isDrugHistory={false}
          patientId={patientId!}
          recordId={universalRecordId!}
          initialState={formInitialState!}
        />
      );
      break;
    case 'newDrugHistory':
      Form = (
        <NewMedicalRecordForm
          isDrugHistory
          patientId={patientId!}
          initialState={formInitialState!}
        />
      );
      break;
    case 'editDrugHistory':
      Form = (
        <EditMedicalRecordForm
          isDrugHistory
          patientId={patientId!}
          recordId={universalRecordId!}
          initialState={formInitialState!}
        />
      );
      break;
    default:
      Form = <NewPatientForm initialState={formInitialState!} />;
  }

  return (
    <FormContainer>
      {formInitialState === undefined ? <LinearProgress /> : <>{Form}</>}
    </FormContainer>
  );
};

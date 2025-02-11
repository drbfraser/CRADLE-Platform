import { PatientState, getPatientState } from './state';
import { useEffect, useState } from 'react';

import LinearProgress from '@mui/material/LinearProgress';
import { PatientForm } from './PatientForm';
import { useParams } from 'react-router-dom';
import { FormContainer } from 'src/shared/components/layout/FormContainer';
import NewPregnancyForm from './pregnancyInfo/NewPregnancyForm';
import EditPregnancyForm from './pregnancyInfo/EditPregnancyForm';
import EditPersonalInfoForm from './personalInfo/EditPersonalInfoForm';
import EditMedicalRecordForm from './medicalInfo/EditMedicalRecordForm';
import NewMedicalRecordForm from './medicalInfo/NewMedicalRecordForm';

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
  if (
    patientId === undefined &&
    editId === undefined &&
    universalRecordId === undefined
  ) {
    return 'newPatient';
  } else if (
    patientId !== undefined &&
    editId === 'personalInfo' &&
    universalRecordId === undefined
  ) {
    return 'editPatient';
  }

  if (
    patientId !== undefined &&
    editId === undefined &&
    universalRecordId === undefined
  ) {
    return 'newPregnancy';
  } else if (
    patientId !== undefined &&
    editId === 'pregnancyInfo' &&
    universalRecordId !== undefined
  ) {
    return 'editPregnancy';
  }

  if (editId === 'medicalHistory') {
    if (universalRecordId === undefined) {
      return 'newMedicalHistory';
    } else {
      return 'editMedicalHistory';
    }
  }

  if (editId === 'drugHistory') {
    if (universalRecordId === undefined) {
      return 'newDrugHistory';
    } else {
      return 'editDrugHistory';
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

  console.log(formInitialState);

  const formType = getFormType(patientId, editId, universalRecordId);
  console.log(formType);

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
          recordId={universalRecordId!}
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
          recordId={universalRecordId!}
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
      Form = <PatientForm initialState={formInitialState!} />;
  }

  return (
    <FormContainer>
      {formInitialState === undefined ? <LinearProgress /> : <>{Form}</>}
    </FormContainer>
  );
};

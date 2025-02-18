import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LinearProgress from '@mui/material/LinearProgress';

import { FormContainer } from 'src/shared/components/layout/FormContainer';
import { NewPatientForm } from './components/NewPatientForm';
import NewPregnancyForm from './components/NewPregnancyForm';
import EditPregnancyForm from './components/EditPregnancyForm';
import EditPersonalInfoForm from './components/EditPersonalInfoForm';
import EditMedicalRecordForm from './components/EditMedicalRecordForm';
import NewMedicalRecordForm from './components/NewMedicalRecordForm';
import { getPatientState } from './state';

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

  const patientStateQuery = useQuery({
    queryKey: ['patientState', patientId, universalRecordId, editId],
    queryFn: () => getPatientState(patientId, universalRecordId, editId),
  });

  if (patientStateQuery.isPending || patientStateQuery.isError) {
    return <LinearProgress />;
  }

  const formType = getFormType(patientId, editId, universalRecordId);
  let Form = null;
  switch (formType) {
    case 'editPatient':
      Form = (
        <EditPersonalInfoForm
          patientId={patientId!}
          initialState={patientStateQuery.data}
        />
      );
      break;
    case 'editPregnancy':
      Form = (
        <EditPregnancyForm
          patientId={patientId!}
          pregnancyId={universalRecordId!}
          initialState={patientStateQuery.data}
        />
      );
      break;
    case 'newPregnancy':
      Form = (
        <NewPregnancyForm
          patientId={patientId!}
          initialState={patientStateQuery.data}
        />
      );
      break;
    case 'newMedicalHistory':
      Form = (
        <NewMedicalRecordForm
          isDrugHistory={false}
          patientId={patientId!}
          initialState={patientStateQuery.data}
        />
      );
      break;
    case 'editMedicalHistory':
      Form = (
        <EditMedicalRecordForm
          isDrugHistory={false}
          patientId={patientId!}
          recordId={universalRecordId!}
          initialState={patientStateQuery.data}
        />
      );
      break;
    case 'newDrugHistory':
      Form = (
        <NewMedicalRecordForm
          isDrugHistory
          patientId={patientId!}
          initialState={patientStateQuery.data}
        />
      );
      break;
    case 'editDrugHistory':
      Form = (
        <EditMedicalRecordForm
          isDrugHistory
          patientId={patientId!}
          recordId={universalRecordId!}
          initialState={patientStateQuery.data}
        />
      );
      break;
    default:
      Form = <NewPatientForm initialState={patientStateQuery.data} />;
  }

  return <FormContainer>{Form}</FormContainer>;
};

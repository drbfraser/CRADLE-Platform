import { CForm } from 'src/shared/types';
import { CustomizedForm } from './customizedEditForm/CustomizedForm';
import { SelectHeaderForm } from './customizedFormHeader/SelectHeaderForm';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { FormRenderStateEnum } from 'src/shared/enums';
import { Box } from '@mui/material';
import usePatient from 'src/shared/hooks/patient';
import PatientHeader from 'src/shared/components/patientHeader/PatientHeader';

type RouteParams = {
  patientId: string;
};

export const CustomizedFormPage = () => {
  const { patientId } = useParams() as RouteParams;
  const [form, setForm] = useState<CForm>();
  const [patient] = usePatient(patientId);

  return (
    <Box sx={{ margin: '0 auto', maxWidth: 1250 }}>
      <PatientHeader title="New Form" patient={patient} />

      <SelectHeaderForm setForm={setForm} />
      {form && form.questions && form!.questions!.length > 0 && (
        <CustomizedForm
          patientId={patientId}
          fm={form}
          renderState={FormRenderStateEnum.FIRST_SUBMIT}
        />
      )}
    </Box>
  );
};

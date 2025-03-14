import { useState } from 'react';
import { useParams } from 'react-router-dom';
import usePatient from 'src/shared/hooks/patient';
import { CForm } from 'src/shared/types';
import { SelectHeaderForm } from './SelectFormTemplate/SelectHeaderForm';
import PatientHeader from 'src/shared/components/patientHeader/PatientHeader';
import { CustomizedForm } from '../components/CustomizedForm';
import { FormRenderStateEnum } from 'src/shared/enums';

type RouteParams = {
  patientId: string;
};

export const CustomizedNewFormPage = () => {
  const { patientId } = useParams() as RouteParams;
  const [form, setForm] = useState<CForm>();
  const { patient } = usePatient(patientId);

  return (
    <>
      <PatientHeader title="New Form" patient={patient} />

      <SelectHeaderForm setForm={setForm} />
      {form && form.questions && form!.questions!.length > 0 && (
        <CustomizedForm
          patientId={patientId}
          fm={form}
          renderState={FormRenderStateEnum.FIRST_SUBMIT}
        />
      )}
    </>
  );
};

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import usePatient from 'src/shared/hooks/patient';
import { CForm } from 'src/shared/types/form/formTypes';
import { SelectFormTemplate } from './SelectFormTemplate';
import PatientHeader from 'src/shared/components/patientHeader/PatientHeader';
import { FormRenderStateEnum } from 'src/shared/enums';
import { CustomizedFormPageContainer } from '../components/CustomizedFormPageContainer';

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

      <SelectFormTemplate setForm={setForm} />
      {form && form.questions && form!.questions!.length > 0 && (
        <CustomizedFormPageContainer
          patientId={patientId}
          fm={form}
          renderState={FormRenderStateEnum.FIRST_SUBMIT}
        />
      )}
    </>
  );
};

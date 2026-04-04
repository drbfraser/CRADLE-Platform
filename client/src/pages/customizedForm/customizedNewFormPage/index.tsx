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
  const [formLang, setFormLang] = useState<string>('');
  const { patient } = usePatient(patientId);

  const handleSetForm = (form: CForm, lang: string) => {
    setForm({ ...form, lang });
    setFormLang(lang);
  };

  return (
    <>
      <PatientHeader title="New Form" patient={patient} />

      <SelectFormTemplate setForm={handleSetForm} />
      {form && form.questions && form!.questions!.length > 0 && (
        <CustomizedFormPageContainer
          patientId={patientId}
          fm={form}
          lang={formLang}
          renderState={FormRenderStateEnum.FIRST_SUBMIT}
        />
      )}
    </>
  );
};

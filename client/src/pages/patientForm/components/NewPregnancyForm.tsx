import { useNavigate } from 'react-router-dom';
import { Form, Formik, FormikProps } from 'formik';

import { PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { PatientState } from '../state';
import { useAddPregnancyMutation } from '../mutations';
import { pregnancyInfoValidationSchema } from './pregnancyInfo/validation';
import { processValues } from './pregnancyInfo/utils';
import PatientFormHeader from './PatientFormHeader';
import { PregnancyInfoForm } from './pregnancyInfo';

type Props = {
  initialState: PatientState;
  patientId: string;
};

const NewPregnancyForm = ({ initialState, patientId }: Props) => {
  const navigate = useNavigate();

  const addNewPregnancy = useAddPregnancyMutation();

  const handleSubmit = (values: PatientState) => {
    const submitValues = { patientId, ...processValues(values) };
    addNewPregnancy.mutate(submitValues, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  return (
    <>
      {addNewPregnancy.isError && !addNewPregnancy.isPending && (
        <APIErrorToast errorMessage={addNewPregnancy.error.message} />
      )}

      <PatientFormHeader patientId={patientId} title="Add New Pregnancy" />
      <Formik
        initialValues={initialState}
        validationSchema={pregnancyInfoValidationSchema}
        onSubmit={handleSubmit}>
        {(formikProps: FormikProps<PatientState>) => (
          <Form>
            <PregnancyInfoForm
              formikProps={formikProps}
              creatingNew={false}
              creatingNewPregnancy
            />

            <PrimaryButton
              sx={{ marginTop: '1rem', float: 'right' }}
              type="submit"
              disabled={addNewPregnancy.isPending}>
              Save
            </PrimaryButton>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default NewPregnancyForm;

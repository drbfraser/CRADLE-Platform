import { useNavigate, useParams } from 'react-router-dom';
import { Form, Formik, FormikProps } from 'formik';

import { PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { initialState, PatientState } from '../state';
import { useAddPregnancyMutation } from '../mutations';
import { pregnancyInfoValidationSchema } from './pregnancyInfo/validation';
import { getPregnancyValues } from './pregnancyInfo/utils';
import PatientFormHeader from './PatientFormHeader';
import { PregnancyInfoForm } from './pregnancyInfo';

type RouteParams = {
  patientId: string;
};

const NewPregnancyForm = () => {
  const { patientId } = useParams() as RouteParams;
  const navigate = useNavigate();

  const addNewPregnancy = useAddPregnancyMutation();

  const handleSubmit = (values: PatientState) => {
    const submitValues = { patientId, ...getPregnancyValues(values) };
    addNewPregnancy.mutate(submitValues, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  return (
    <>
      {addNewPregnancy.isError && (
        <APIErrorToast
          errorMessage={addNewPregnancy.error.message}
          onClose={() => addNewPregnancy.reset()}
        />
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

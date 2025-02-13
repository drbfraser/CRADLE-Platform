import { useNavigate } from 'react-router-dom';
import { Form, Formik, FormikProps } from 'formik';

import { PrimaryButton } from 'src/shared/components/Button';
import { SexEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { PatientField, PatientState } from '../state';
import { useUpdatePatientMutation } from '../mutations';
import { personalInfoValidationSchema } from './personalInfo/validation';
import PatientFormHeader from './PatientFormHeader';
import { PersonalInfoForm } from './personalInfo';

export type PatientData = {
  id: string;
  name: string;
  householdNumber: string;
  isExactDateOfBirth: boolean;
  dateOfBirth: string;
  zone: string;
  villageNumber: string;
  sex: SexEnum;
  drugHistory: string;
  medicalHistory: string;
  allergy: string;
};

export const getPatientData = (
  values: PatientState,
  patientId?: string
): PatientData => ({
  id: patientId ?? values[PatientField.patientId],
  name: values[PatientField.patientName],
  householdNumber: values[PatientField.householdNumber],
  isExactDateOfBirth: Boolean(values[PatientField.isExactDateOfBirth]),
  dateOfBirth: values[PatientField.dateOfBirth],
  zone: values[PatientField.zone],
  villageNumber: values[PatientField.villageNumber],
  sex: values[PatientField.patientSex] as SexEnum,
  drugHistory: values[PatientField.drugHistory],
  medicalHistory: values[PatientField.medicalHistory],
  allergy: values[PatientField.allergy],
});

type Props = {
  patientId: string;
  initialState: PatientState;
};

const EditPersonalInfoForm = ({ patientId, initialState }: Props) => {
  const navigate = useNavigate();

  const updatePatient = useUpdatePatientMutation(patientId);

  const handleSubmit = (values: PatientState) => {
    const patientData = getPatientData(values, patientId);
    updatePatient.mutate(patientData, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  return (
    <>
      {updatePatient.isError && (
        <APIErrorToast onClose={() => updatePatient.reset()} />
      )}

      <PatientFormHeader
        patientId={patientId}
        title="Edit Personal Information"
      />
      <Formik
        initialValues={initialState}
        validationSchema={personalInfoValidationSchema(false)}
        onSubmit={handleSubmit}>
        {(formikProps: FormikProps<PatientState>) => (
          <Form>
            <PersonalInfoForm formikProps={formikProps} creatingNew={false} />

            <PrimaryButton
              sx={{ marginTop: '1rem', float: 'right' }}
              type="submit"
              disabled={updatePatient.isPending}>
              Save
            </PrimaryButton>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditPersonalInfoForm;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import {
  Box,
  Step,
  StepLabel,
  Stepper,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { PrimaryButton, SecondaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { getDOBForEstimatedAge } from 'src/shared/utils';
import { initialState, PatientField, PatientState } from '../state';
import {
  useAddPatientInfoMutation,
  useAddPregnancyMutation,
} from '../mutations';
import { personalInfoValidationSchema } from './personalInfo/validation';
import { pregnancyInfoValidationSchema } from './pregnancyInfo/validation';
import { getPatientData } from './EditPersonalInfoForm';
import { MedicalInfoForm } from './medicalInfo';
import { PersonalInfoForm } from './personalInfo';
import { PregnancyInfoForm } from './pregnancyInfo';
import PatientFormHeader from './PatientFormHeader';
import { getPregnancyValues } from './pregnancyInfo/utils';
import {
  drugHistoryValidationSchema,
  medicalHistoryValidationSchema,
} from './medicalInfo/validation';

const STEPS = [
  {
    name: 'Patient Personal Information',
    component: PersonalInfoForm,
    validationSchema: personalInfoValidationSchema,
    title: 'New Patient',
  },
  {
    name: 'Pregnancy Information',
    component: PregnancyInfoForm,
    validationSchema: pregnancyInfoValidationSchema,
    title: 'New Patient',
  },
  {
    name: 'Medical Information',
    component: MedicalInfoForm,
    validationSchema: medicalHistoryValidationSchema.concat(
      drugHistoryValidationSchema
    ),
    title: 'Add Medical History',
  },
];

export const NewPatientForm = () => {
  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const navigate = useNavigate();

  const addPatientInfo = useAddPatientInfoMutation();
  const addPregnancyInfo = useAddPregnancyMutation();

  const handleSubmit = async (values: PatientState) => {
    try {
      const patientData = getPatientData(values);
      if (!patientData.isExactDateOfBirth) {
        patientData.dateOfBirth = getDOBForEstimatedAge(
          parseInt(values[PatientField.estimatedAge])
        );
      }
      const response = await addPatientInfo.mutateAsync(patientData);
      const patientId = response.data.id;

      const isPregnant = Boolean(values[PatientField.isPregnant]);
      if (isPregnant) {
        const pregnancyValues = getPregnancyValues(values);

        await addPregnancyInfo.mutateAsync({
          patientId,
          startDate: pregnancyValues.startDate,
        });
      }

      navigate(`/patients/${patientId}`);
    } catch (e) {
      console.error(e);
    }
  };

  const [stepNum, setStepNum] = useState(0);
  const StepComponent = STEPS[stepNum].component;
  const isFinalStep = stepNum === STEPS.length - 1;

  const handleNextStep = (
    values: PatientState,
    helpers: FormikHelpers<PatientState>
  ) => {
    if (isFinalStep) {
      handleSubmit(values);
    } else {
      helpers.setTouched({});
      setStepNum(stepNum + 1);
    }
  };

  const isSubmitting = addPatientInfo.isPending || addPregnancyInfo.isPending;
  return (
    <>
      {addPatientInfo.isError && (
        <APIErrorToast
          errorMessage={addPatientInfo.error.message}
          onClose={() => addPatientInfo.reset()}
        />
      )}
      {addPregnancyInfo.isError && (
        <APIErrorToast
          errorMessage={addPregnancyInfo.error.message}
          onClose={() => addPregnancyInfo.reset()}
        />
      )}

      <PatientFormHeader title={STEPS[stepNum].title} />

      <Stepper
        sx={{ marginBottom: '1rem' }}
        activeStep={stepNum}
        orientation={isBigScreen ? 'horizontal' : 'vertical'}>
        {STEPS.map((step, index) => (
          <Step key={index}>
            <StepLabel>{step.name}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Formik
        initialValues={initialState}
        onSubmit={handleNextStep}
        validationSchema={STEPS[stepNum].validationSchema}>
        {(formikProps: FormikProps<PatientState>) => (
          <Form>
            <StepComponent formikProps={formikProps} creatingNew={true} />

            <Box sx={{ marginTop: '1rem' }}>
              <SecondaryButton
                onClick={() => setStepNum(stepNum - 1)}
                disabled={stepNum === 0 || isSubmitting}>
                Back
              </SecondaryButton>

              <PrimaryButton
                sx={{
                  float: 'right',
                }}
                type="submit"
                disabled={isSubmitting}>
                {isFinalStep ? 'Create' : 'Next'}
              </PrimaryButton>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

import { PrimaryButton, SecondaryButton } from 'src/shared/components/Button';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { MedicalInfoForm } from './medicalInfo';
import { PatientField, PatientState } from './state';
import { PersonalInfoForm } from './personalInfo';
import Step from '@mui/material/Step/Step';
import StepLabel from '@mui/material/StepLabel/StepLabel';
import Stepper from '@mui/material/Stepper/Stepper';
import { personalInfoValidationSchema } from './personalInfo/validation';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { PregnancyInfoForm } from './pregnancyInfo';
import { pregnancyInfoValidationSchema } from './pregnancyInfo/validation';
import {
  getPatientData,
  PatientData,
} from './personalInfo/EditPersonalInfoForm';
import { useMutation } from '@tanstack/react-query';
import { API_URL, axiosFetch } from 'src/shared/api/api';
import { EndpointEnum, GestationalAgeUnitEnum } from 'src/shared/enums';
import { getDOBForEstimatedAge } from 'src/shared/utils';
import { gestationalAgeUnitTimestamp } from 'src/shared/constants';
import PatientFormHeader from './PatientFormHeader';

const STEPS = [
  {
    editId: 'personalInfo',
    name: 'Patient Personal Information',
    component: PersonalInfoForm,
    validationSchema: personalInfoValidationSchema(true),
    title: 'New Patient',
  },
  {
    editId: 'pregnancyInfo',
    name: 'Pregnancy Information',
    component: PregnancyInfoForm,
    validationSchema: pregnancyInfoValidationSchema,
    title: 'New Patient',
  },
  {
    editId: 'medicalHistory',
    name: 'Medical Information',
    component: MedicalInfoForm,
    validationSchema: undefined,
    isDrugRecord: undefined,
    title: 'Add Medical History',
  },
];

type PregnancyData = {
  patientId: string;
  startDate: number;
};

interface PatientFormProps {
  initialState: PatientState;
}

export const PatientForm = ({ initialState }: PatientFormProps) => {
  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const navigate = useNavigate();

  const addPatientInfo = useMutation({
    mutationFn: (patientData: PatientData) => {
      const endpoint = API_URL + EndpointEnum.PATIENTS;
      return axiosFetch(endpoint, { method: 'POST', data: patientData });
    },
  });

  const addPregnancyInfo = useMutation({
    mutationFn: (values: PregnancyData) => {
      const endpoint =
        API_URL +
        EndpointEnum.PATIENTS +
        `/${values.patientId}` +
        EndpointEnum.PREGNANCIES;
      return axiosFetch(endpoint, { method: 'POST', data: values });
    },
  });

  const handleSubmit = async (values: PatientState) => {
    try {
      const patientData = getPatientData(values);
      if (!patientData.isExactDateOfBirth) {
        patientData.dateOfBirth = getDOBForEstimatedAge(
          parseInt(values[PatientField.estimatedAge])
        );
      }
      const res = await addPatientInfo.mutateAsync(patientData);
      const patientId = res.data.id;

      const isPregnant = Boolean(values[PatientField.isPregnant]);
      if (isPregnant) {
        let pregnancyStartDate =
          values.gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
            ? gestationalAgeUnitTimestamp[GestationalAgeUnitEnum.WEEKS](
                values.gestationalAgeWeeks,
                values.gestationalAgeDays
              )
            : gestationalAgeUnitTimestamp[GestationalAgeUnitEnum.MONTHS](
                values.gestationalAgeMonths
              );
        pregnancyStartDate = Math.round(pregnancyStartDate);
        await addPregnancyInfo.mutateAsync({
          startDate: pregnancyStartDate,
          patientId,
        });
      }

      navigate(`/patients/${patientId}`);
    } catch (e) {
      console.error(e);
    }
  };

  const [stepNum, setStepNum] = useState(0);
  const PageComponent = STEPS[stepNum].component;
  const isFinalPage = stepNum === STEPS.length - 1;

  const handleNextStep = (
    values: PatientState,
    helpers: FormikHelpers<PatientState>
  ) => {
    if (isFinalPage) {
      handleSubmit(values);
    } else {
      helpers.setTouched({});
      setStepNum(stepNum + 1);
    }
  };

  const isSubmitting = addPatientInfo.isPending || addPregnancyInfo.isPaused;
  return (
    <>
      {addPatientInfo.isError && !addPatientInfo.isPending && (
        <APIErrorToast errorMessage={addPatientInfo.error.message} />
      )}
      {addPregnancyInfo.isError && !addPregnancyInfo.isPending && (
        <APIErrorToast errorMessage={addPregnancyInfo.error.message} />
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
            <PageComponent
              formikProps={formikProps}
              creatingNew={true}
              isDrugRecord={STEPS[stepNum].isDrugRecord}
            />

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
                {isFinalPage ? 'Create' : 'Next'}
              </PrimaryButton>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

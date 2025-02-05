import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import { Field, Form, Formik } from 'formik';
import { Alert, Box, Grid, Paper, Typography } from '@mui/material';

import { selectCurrentUser } from 'src/redux/reducers/user/currentUser';
import { useAppSelector } from 'src/shared/hooks';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { PrimaryButton } from 'src/shared/components/Button';
import { assessmentFormValidationSchema } from './validation';
import { AssessmentField, AssessmentState } from './state';
import useSaveAssessment from './mutations';

interface IProps {
  initialState: AssessmentState;
  patientId: string;
  assessmentId: string | undefined;
  referralId: string | undefined;
}

export const AssessmentForm = ({
  initialState,
  patientId,
  assessmentId,
  referralId,
}: IProps) => {
  const { data: currentUser } = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [displayEmptyFormError, setDisplayEmptyFormError] = useState(false);
  const saveAssessment = useSaveAssessment();

  const validate = (values: AssessmentState) => {
    const errors: Partial<AssessmentState> = {};
    const valid = !!(
      values[AssessmentField.investigation]?.trim() ||
      values[AssessmentField.finalDiagnosis]?.trim() ||
      values[AssessmentField.treatment]?.trim() ||
      values[AssessmentField.drugHistory]?.trim()
    );
    setDisplayEmptyFormError(!valid);
    return errors;
  };

  const handleSubmit = async (
    values: AssessmentState,
    setSubmitting: (submitting: boolean) => void
  ) => {
    saveAssessment.mutate(
      {
        patientId,
        assessmentId,
        referralId,
        initialDrugHistory: initialState.drugHistory,
        formValues: values,
      },
      {
        onSuccess: () => navigate(`/patients/${patientId}`),
        onError: () => setSubmitting(false),
      }
    );
  };

  return (
    <>
      <APIErrorToast open={saveAssessment.isError} onClose={() => {}} />
      {displayEmptyFormError && (
        <Alert
          sx={{ marginBottom: '1rem' }}
          severity="error"
          onClose={() => setDisplayEmptyFormError(false)}>
          Unable to submit an empty assessment form
        </Alert>
      )}

      <Formik
        initialValues={initialState}
        name={'assessmentForm'}
        onSubmit={(values: AssessmentState, { setSubmitting }: any) =>
          handleSubmit(values, setSubmitting)
        }
        validate={validate}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={assessmentFormValidationSchema}>
        {({ values, isSubmitting }) => (
          <Form>
            <Paper sx={{ padding: 2 }}>
              <Box sx={{ marginBottom: '1rem' }}>
                <Typography component="h2" variant="h4">
                  Assessment
                </Typography>
                <Typography color="primary" variant="subtitle1">
                  At least one of Investigation Results, Final Diagnosis,
                  Treatment / Operation, and Drug History must be entered
                </Typography>
              </Box>

              <Grid container pt={1} pl={3} pr={3} spacing={3}>
                <Grid item sm={12} md={6}>
                  <Field
                    component={TextField}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    name={AssessmentField.investigation}
                    label="Investigation Results (if available)"
                  />
                </Grid>
                <Grid item sm={12} md={6}>
                  <Field
                    component={TextField}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    name={AssessmentField.finalDiagnosis}
                    label="Final Diagnosis"
                  />
                </Grid>
                <Grid item sm={12} md={6}>
                  <Field
                    component={TextField}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    name={AssessmentField.treatment}
                    label="Treatment / Operation"
                  />
                </Grid>
                <Grid item sm={12} md={6}>
                  <Field
                    component={TextField}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    name={AssessmentField.drugHistory}
                    label="Drug history (add new drugs /edit existing drugs; include dose and frequency)"
                  />
                </Grid>
                <Grid item sm={12} md={4}>
                  <Field
                    component={CheckboxWithLabel}
                    type="checkbox"
                    name={AssessmentField.followUp}
                    Label={{ label: 'VHT Follow-up in Discharging' }}
                  />
                </Grid>
                <Grid item sm={12} md={8}>
                  <Field
                    component={TextField}
                    variant="outlined"
                    fullWidth
                    multiline
                    name={AssessmentField.followUpInstructions}
                    label="Instructions for Follow-up"
                    required={values[AssessmentField.followUp]}
                    disabled={!values[AssessmentField.followUp]}
                  />
                </Grid>
                <Grid item sm={12} md={8}>
                  <Typography variant="caption">
                    Editing the Medication Prescribed updates the patient&apos;s
                    Drug History. <br />
                    Consider updating the patient&apos;s Medical History on the
                    Patient Summary screen to mention any updated medical
                    conditions.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <PrimaryButton
              sx={{
                marginTop: '1rem',
                float: 'right',
              }}
              type="submit"
              disabled={isSubmitting}>
              {assessmentId === undefined ? 'Create' : 'Save Changes'}
            </PrimaryButton>
          </Form>
        )}
      </Formik>
    </>
  );
};

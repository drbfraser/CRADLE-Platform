import { AssessmentField, AssessmentState } from './state';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import { Field, Form, Formik } from 'formik';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { PrimaryButton } from 'src/shared/components/Button';
import { Typography } from '@mui/material';
import { assessmentFormValidationSchema } from './validation';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  saveAssessmentAsync,
  saveDrugHistoryAsync,
  saveReferralAssessmentAsync,
} from 'src/shared/api/api';

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
  const [submitError, setSubmitError] = useState(false);
  const [displayEmptyFormError, setDisplayEmptyFormError] = useState(false);
  const drugHistory = initialState.drugHistory;
  const navigate = useNavigate();

  const validate = (values: any) => {
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
    patientId: string,
    assessmentId: string | undefined,
    referralId: string | undefined,
    drugHistory: string,
    setSubmitError: (error: boolean) => void,
    values: AssessmentState,
    setSubmitting: (submitting: boolean) => void
  ) => {
    const newAssessment = {
      [AssessmentField.investigation]: values[AssessmentField.investigation],
      [AssessmentField.finalDiagnosis]: values[AssessmentField.finalDiagnosis],
      [AssessmentField.treatment]: values[AssessmentField.treatment],
      [AssessmentField.medication]: values[AssessmentField.drugHistory],
      [AssessmentField.followUp]: values[AssessmentField.followUp],
      [AssessmentField.followUpInstructions]:
        values[AssessmentField.followUpInstructions],
    };

    try {
      await saveAssessmentAsync(newAssessment, assessmentId, patientId);

      const newDrugHistory = values[AssessmentField.drugHistory];

      if (drugHistory !== newDrugHistory) {
        await saveDrugHistoryAsync(newDrugHistory, patientId);
      }
      //this case only happens when users click the 'assess referral' button on the
      //referral pending button! this clicking will trigger two request: 1. create a new assessment
      //2.after successfully creating a new assessment, we will send a request to mark the
      //original referral record to be 'assessed'
      if (referralId !== undefined) {
        await saveReferralAssessmentAsync(referralId);
      }

      navigate(`/patients/${patientId}`);
    } catch (e) {
      setSubmitError(true);
      setSubmitting(false);
    }
  };

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      {displayEmptyFormError && (
        <>
          <Alert
            severity="error"
            onClose={() => setDisplayEmptyFormError(false)}>
            Unable to submit an empty assessment form
          </Alert>
          <br />
          <br />
        </>
      )}
      <Formik
        initialValues={initialState}
        name={'assessmentForm'}
        onSubmit={(values: AssessmentState, { setSubmitting }: any) =>
          handleSubmit(
            patientId,
            assessmentId,
            referralId,
            drugHistory,
            setSubmitError,
            values,
            setSubmitting
          )
        }
        validate={validate}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={assessmentFormValidationSchema}>
        {({ values, isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={2}>
                <h2>Assessment</h2>
                <Typography color="primary" variant="subtitle1">
                  At least one of Investigation Results, Final Diagnosis,
                  Treatment / Operation, and Drug History must be entered
                </Typography>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>
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
                        Editing the Medication Prescribed updates the
                        patient&apos;s Drug History. <br />
                        Consider updating the patient&apos;s Medical History on
                        the Patient Summary screen to mention any updated
                        medical conditions.
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>
            <br />
            <PrimaryButton
              sx={{
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

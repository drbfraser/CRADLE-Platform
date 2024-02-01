import { CForm, QAnswer } from 'src/shared/types';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { initialState, validationSchema } from './state';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { PrimaryButton, RedirectButton } from 'src/shared/components/Button';
import { handleSubmit } from './handlers';
import makeStyles from '@mui/styles/makeStyles';
import { FormRenderStateEnum } from 'src/shared/enums';
import { FormQuestions } from '../FormQuestions';

interface IProps {
  patientId: string;
  fm: CForm;
  renderState: FormRenderStateEnum;
}

export const CustomizedForm = ({ patientId, fm, renderState }: IProps) => {
  const questions = fm.questions;
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  const [multiSelectValidationFailed, setMultiSelectValidationFailed] =
    useState(false);

  const [answers, setAnswers] = useState<QAnswer[]>([]);
  let formTitle: string;
  switch (renderState) {
    case FormRenderStateEnum.EDIT:
      formTitle = 'Update Form';
      break;
    case FormRenderStateEnum.VIEW:
      formTitle = 'Edit Form';
      break;
    case FormRenderStateEnum.FIRST_SUBMIT:
      formTitle = 'Submit Form';
      break;
    case FormRenderStateEnum.SUBMIT_TEMPLATE:
      formTitle = 'Submit Form Template';
      break;
    default:
      formTitle = 'error!!!!!';
      break;
  }

  const handleMultiSelectValidationFailed = (ValidationFailed: boolean) => {
    setMultiSelectValidationFailed(ValidationFailed);
  };

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState as any}
        validationSchema={validationSchema}
        onSubmit={handleSubmit(
          patientId,
          answers,
          setSubmitError,
          handleMultiSelectValidationFailed,
          renderState === FormRenderStateEnum.EDIT,
          fm
        )}>
        {({ isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={4} pt={6} m={2}>
                {renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? (
                  <Grid container spacing={3}>
                    {/* This is redundant */}
                    <h2>Current Form</h2>
                    <Divider />
                  </Grid>
                ) : (
                  <></>
                )}
                <Grid container spacing={3}>
                  {FormQuestions({
                    questions: questions,
                    renderState: renderState,
                    language: '',
                    handleAnswers: setAnswers,
                    multiSelectValidationFailed: multiSelectValidationFailed,
                  })}
                </Grid>
                {renderState === FormRenderStateEnum.VIEW ? (
                  <RedirectButton
                    type="button" //This makes the button not trigger onSubmit function
                    url={`/forms/edit/${patientId}/${fm.id}`}
                    className={classes.right}>
                    {formTitle}
                  </RedirectButton>
                ) : renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? (
                  <PrimaryButton
                    className={classes.right}
                    onClick={() => console.log('click finish button')}
                    // TO DO: clicking "finish" saves the form.
                    type="button">
                    {formTitle}
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    className={classes.right}
                    type="submit"
                    disabled={isSubmitting}>
                    {formTitle}
                  </PrimaryButton>
                )}
              </Box>
            </Paper>
          </Form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles({
  right: {
    display: 'flex',
    marginRight: '0px',
    marginLeft: 'auto',
    marginTop: '10px',
  },
});

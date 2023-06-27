import { FormTemplateWithQuestions } from 'src/shared/types';
import { Form, Formik } from 'formik';
import { Dispatch, SetStateAction, useState } from 'react';
import { initialState, validationSchema } from './state';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { PrimaryButton } from 'src/shared/components/Button';
import makeStyles from '@mui/styles/makeStyles';
import { FormRenderStateEnum } from 'src/shared/enums';
import { FormQuestions } from '../FormQuestions';
import SubmitFormTemplateDialog from './SubmitFormTemplateDialog';

interface IProps {
  fm: FormTemplateWithQuestions;
  language: string;
  renderState: FormRenderStateEnum;
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestions>>;
}

export const CustomizedFormWQuestions = ({
  fm,
  language,
  renderState,
  setForm,
}: IProps) => {
  const questions = fm.questions;
  const classes = useStyles();

  const [submitError, setSubmitError] = useState(false);
  const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);

  // const [multiSelectValidationFailed, setMultiSelectValidationFailed] =
  //   useState(false);

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

  // const handleMultiSelectValidationFailed = (ValidationFailed: boolean) => {
  //   setMultiSelectValidationFailed(ValidationFailed);
  // };

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState as any}
        validationSchema={validationSchema}
        onSubmit={() => {
          // pass
        }}>
        {({ isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={4} pt={6} m={2}>
                <Grid container spacing={3}>
                  <h2>Current Form</h2>
                  <Divider />
                </Grid>
                <Grid container spacing={3}>
                  <FormQuestions
                    questions={questions}
                    renderState={renderState}
                    language={language}
                    handleAnswers={() => {
                      // pass
                    }}
                    setForm={setForm}
                  />
                </Grid>
                <PrimaryButton
                  className={classes.right}
                  onClick={() => {
                    setIsSubmitPopupOpen(true);
                  }}
                  type="button">
                  {formTitle}
                </PrimaryButton>
                <SubmitFormTemplateDialog
                  open={isSubmitPopupOpen}
                  onClose={() => setIsSubmitPopupOpen(false)}
                  form={fm}
                />
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

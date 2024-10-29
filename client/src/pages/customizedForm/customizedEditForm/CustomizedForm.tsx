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
import { FormRenderStateEnum } from 'src/shared/enums';
import { FormQuestions } from '../FormQuestions';
import { SxProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface IProps {
  patientId: string;
  fm: CForm;
  renderState: FormRenderStateEnum;
}

export const CustomizedForm = ({ patientId, fm, renderState }: IProps) => {
  const questions = fm.questions;
  const [submitError, setSubmitError] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(false);
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

  const buttonSx: SxProps = {
    display: 'flex',
    marginRight: '0px',
    marginLeft: 'auto',
    marginTop: '10px',
  };

  const navigate = useNavigate();

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
          fm,
          navigate
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
                    handleAnswers: (answers) => {
                      setAnswers(answers);
                    },
                    multiSelectValidationFailed: multiSelectValidationFailed,
                    setDisableSubmit: setDisableSubmit,
                  })}
                </Grid>
                {renderState === FormRenderStateEnum.VIEW ? (
                  <RedirectButton
                    type="button" //This makes the button not trigger onSubmit function
                    url={`/forms/edit/${patientId}/${fm.id}`}
                    sx={buttonSx}>
                    {formTitle}
                  </RedirectButton>
                ) : renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? (
                  <PrimaryButton
                    sx={buttonSx}
                    onClick={() => console.log('click finish button')}
                    // TO DO: clicking "finish" saves the form.
                    type="button">
                    {formTitle}
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    sx={buttonSx}
                    type="submit"
                    disabled={isSubmitting || disableSubmit}>
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

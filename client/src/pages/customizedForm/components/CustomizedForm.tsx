import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { Divider, Grid, Paper, SxProps } from '@mui/material';

import { CForm, QAnswer } from 'src/shared/types/form/formTypes';
import { FormRenderStateEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { PrimaryButton, RedirectButton } from 'src/shared/components/Button';
import { FormQuestions } from './FormQuestions';
import {
  ApiAnswer,
  areMcResponsesValid,
  PostBody,
  areNumberResponsesValid,
  TransferQAnswerToAPIStandard,
  TransferQAnswerToPostBody,
} from '../handlers';
import { initialState, validationSchema } from '../state';
import { useSubmitCustomForm } from '../mutations';

const BUTTON_SX: SxProps = {
  display: 'flex',
  marginRight: '0px',
  marginLeft: 'auto',
  marginTop: '10px',
} as const;

interface IProps {
  patientId: string;
  fm: CForm;
  renderState: FormRenderStateEnum;
}

export const CustomizedForm = ({
  patientId,
  fm: form,
  renderState,
}: IProps) => {
  const navigate = useNavigate();
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [multiSelectValidationFailed, setMultiSelectValidationFailed] =
    useState(false);
  const [answers, setAnswers] = useState<QAnswer[]>([]);

  const submitCustomForm = useSubmitCustomForm();
  const handleSubmit = () => {
    if (!areMcResponsesValid(form.questions, answers)) {
      setMultiSelectValidationFailed(true);
      return;
    }

    //2 number-range validation
    if (!areNumberResponsesValid(form.questions, answers)) {
      return;
    }

    const anss: ApiAnswer[] = TransferQAnswerToAPIStandard(
      answers,
      form.questions
    );
    const postBody: PostBody = TransferQAnswerToPostBody(
      anss,
      form,
      patientId,
      renderState === FormRenderStateEnum.EDIT
    );
    submitCustomForm.mutate(
      { formId: form.id, postBody },
      {
        onSuccess: () => navigate(`/patients/${patientId}`),
      }
    );
  };

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

  return (
    <>
      <APIErrorToast
        open={submitCustomForm.isError}
        onClose={() => submitCustomForm.reset()}
      />

      <Formik
        initialValues={initialState as any}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {() => (
          <Form>
            <Paper sx={{ p: 6, mt: 2 }}>
              {renderState === FormRenderStateEnum.SUBMIT_TEMPLATE && (
                <Grid container spacing={3}>
                  {/* This is redundant */}
                  <h2>Current Form</h2>
                  <Divider />
                </Grid>
              )}

              <Grid container spacing={3}>
                {FormQuestions({
                  questions: form.questions,
                  renderState,
                  language: '',
                  handleAnswers: (answers) => {
                    setAnswers(answers);
                  },
                  multiSelectValidationFailed,
                  setDisableSubmit,
                })}
              </Grid>
              {renderState === FormRenderStateEnum.VIEW ? (
                <RedirectButton
                  sx={BUTTON_SX}
                  type="button" //This makes the button not trigger onSubmit function
                  url={`/forms/edit/${patientId}/${form.id}`}>
                  {formTitle}
                </RedirectButton>
              ) : renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? (
                <PrimaryButton
                  sx={BUTTON_SX}
                  onClick={() => console.log('click finish button')}
                  // TO DO: clicking "finish" saves the form.
                  type="button">
                  {formTitle}
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  sx={BUTTON_SX}
                  type="submit"
                  disabled={submitCustomForm.isPending || disableSubmit}>
                  {formTitle}
                </PrimaryButton>
              )}
            </Paper>
          </Form>
        )}
      </Formik>
    </>
  );
};

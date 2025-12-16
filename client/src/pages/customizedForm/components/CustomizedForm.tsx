import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { Divider, Grid, SxProps } from '@mui/material';

import { CForm, QAnswer, Question } from 'src/shared/types/form/formTypes';
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
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';

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
  isFormModal?: boolean;
  customSubmitHandler?: (form: CForm, postBody: PostBody) => void;
}

export const CustomizedForm = ({
  patientId,
  fm: form,
  renderState,
  isFormModal = false,
  customSubmitHandler,
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
    if (
      !areNumberResponsesValid(form.questions as unknown as Question[], answers)
    ) {
      // TODO: update this type when form submissions v2 are integrated
      return;
    }

    const anss: ApiAnswer[] = TransferQAnswerToAPIStandard(
      answers,
      form.questions as unknown as Question[] // TODO: update this type when form submissions v2 are integrated
    );
    const postBody: PostBody = TransferQAnswerToPostBody(
      anss,
      form,
      patientId,
      renderState === FormRenderStateEnum.EDIT
    );

    if (customSubmitHandler) {
      customSubmitHandler(form, postBody);
    } else {
      submitCustomForm.mutate(
        { formId: form.id, postBody },
        {
          onSuccess: () => navigate(`/patients/${patientId}`),
        }
      );
    }
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
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {() => (
          <Form>
            {renderState === FormRenderStateEnum.SUBMIT_TEMPLATE && (
              <Grid container spacing={3}>
                {/* This is redundant */}
                <h2>Current Form</h2>
                <Divider />
              </Grid>
            )}

            <Grid container spacing={3}>
              {FormQuestions({
                questions: form.questions as unknown as TQuestion[],
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
              !isFormModal && (
                <RedirectButton
                  sx={BUTTON_SX}
                  type="button" //This makes the button not trigger onSubmit function
                  url={`/forms/edit/${patientId}/${form.id}`}>
                  {formTitle}
                </RedirectButton>
              )
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
          </Form>
        )}
      </Formik>
    </>
  );
};

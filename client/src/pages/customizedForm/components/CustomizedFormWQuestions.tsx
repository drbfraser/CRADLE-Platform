import { FormTemplateWithQuestionsV2 } from 'src/shared/types/form/formTemplateTypes';
import { Formik } from 'formik';
import { Dispatch, Fragment, SetStateAction } from 'react';
import { initialState, validationSchema } from '../state';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { PrimaryButton } from 'src/shared/components/Button';
import { Typography } from '@mui/material';
import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { FormQuestions } from './FormQuestions';
import SubmitFormTemplateDialog from './SubmitFormTemplateDialog';
import EditField from 'src/pages/admin/manageFormTemplates/editFormTemplate/EditField';
import EditCategory from 'src/pages/admin/manageFormTemplates/editFormTemplate/EditCategory';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { useCustomizedFormWQuestions } from 'src/shared/hooks/forms/useCustomizedFormWQuestions';
import {
  FormQuestionRowActions,
  moveQuestionDown,
  moveQuestionUp,
} from './FormQuestionRowActions';
import { FormEditorHeader } from './FormEditorHeader';
import { FormEditorFooter } from './FormEditorFooter';
interface IProps {
  fm: FormTemplateWithQuestionsV2;
  languages: string[];
  renderState: FormRenderStateEnum;
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestionsV2>>;
  versionError: boolean;
  setCurrentLanguage: Dispatch<SetStateAction<string>>;
}

export const CustomizedFormWQuestions = ({
  fm,
  languages,
  renderState,
  setForm,
  versionError,
  setCurrentLanguage,
}: IProps) => {
  const hook = useCustomizedFormWQuestions(
    fm,
    languages,
    versionError,
    setForm,
    setCurrentLanguage
  );

  return (
    <>
      <APIErrorToast
        open={hook.submitError}
        onClose={() => hook.setSubmitError(false)}
        errorMessage={hook.errorMessage}
      />
      <EditCategory
        open={hook.categoryPopupOpen}
        onClose={() => {
          hook.setSelectedOrder(null);
          hook.setCategoryPopupOpen(false);
        }}
        visibilityDisabled={
          hook.categoryIndex != null &&
          fm.questions[hook.categoryIndex].visibleCondition.length > 0
        }
        inputLanguages={
          hook.selectedOrder !== null
            ? hook.getInputLanguages(hook.questions[hook.selectedOrder])
            : languages
        }
        setForm={setForm}
        question={
          hook.selectedOrder !== null
            ? hook.questions[hook.selectedOrder]
            : undefined
        }
        questionsArr={fm.questions}
        visibilityToggle={
          hook.selectedOrder !== null &&
          fm.questions[hook.selectedOrder]?.visibleCondition.length > 0
        }
        categoryIndex={hook.categoryIndex}
      />
      <EditField
        open={hook.editPopupOpen}
        onClose={() => {
          hook.setSelectedOrder(null);
          hook.setEditPopupOpen(false);
        }}
        inputLanguages={
          hook.selectedOrder !== null
            ? hook.getInputLanguages(hook.questions[hook.selectedOrder])
            : languages
        }
        setForm={setForm}
        question={
          hook.selectedOrder !== null
            ? hook.questions[hook.selectedOrder]
            : undefined
        }
        questionsArr={fm.questions}
        visibilityDisabled={
          hook.selectedOrder !== null
            ? hook.questions[hook.selectedOrder].categoryIndex !== null &&
              fm.questions[
                hook.questions[hook.selectedOrder].categoryIndex ?? 0
              ].visibleCondition.length > 0
            : hook.categoryIndex != null &&
              fm.questions[hook.categoryIndex].visibleCondition.length > 0
        }
        visibilityToggle={hook.visibilityToggle}
        setVisibilityToggle={hook.setVisibilityToggle}
        categoryIndex={hook.categoryIndex}
      />
      <DeleteCategoryDialog
        open={hook.isDeletePopupOpen}
        onClose={hook.handleDeleteOnClose}
        numQuestionsProp={
          hook.questions.filter((q) => q.categoryIndex === hook.selectedOrder)
            .length
        }
      />
      <Formik
        initialValues={initialState as any}
        validationSchema={validationSchema}
        onSubmit={() => {
          // pass
        }}>
        {({ isSubmitting }) => (
          <Paper>
            <Box p={4} pt={6} m={2}>
              <Grid container spacing={3}>
                <FormEditorHeader
                  languages={languages}
                  selectedLanguage={hook.selectedLanguage}
                  onLanguageChange={hook.setSelectedLanguage}
                />
                <Grid id={'form-container'} item container spacing={3}>
                  {FormQuestions({
                    questions: hook.questions,
                    renderState: renderState,
                    language: hook.selectedLanguage,
                    handleAnswers: () => {
                      // pass
                    },
                    setForm: setForm,
                  }).map((q, index) => {
                    const question = hook.questions[index];
                    return (
                      <Fragment key={`rendered-${question.order}`}>
                        {q}
                        {question.questionType == QuestionTypeEnum.CATEGORY && (
                          <Grid
                            id={'add-field-button-container'}
                            item
                            xs={hook.isMobile ? 10 : 1}
                            sm={4}
                            md={3}
                            lg={2}
                            xl={1.5}
                            sx={{
                              '@media (max-width: 600px)': {
                                width: '100%',
                              },
                            }}>
                            <PrimaryButton
                              id={'add-field-button'}
                              sx={{
                                width: '100%',
                              }}
                              onClick={() => {
                                if (languages.length != 0) {
                                  hook.setCategoryIndex(question.order);
                                  hook.setVisibilityToggle(
                                    question.visibleCondition.length > 0
                                  );
                                  hook.setEditPopupOpen(true);
                                } else {
                                  hook.setSubmitError(true);
                                  hook.setErrorMessage(
                                    'Select at least one language before creating a field'
                                  );
                                }
                              }}>
                              <AddIcon />
                              {'Add Field'}
                            </PrimaryButton>
                          </Grid>
                        )}
                        <FormQuestionRowActions
                          question={question}
                          onMoveUp={(q) =>
                            moveQuestionUp(q, {
                              handleCatUp: hook.handleCatUp,
                              handleFieldUp: hook.handleFieldUp,
                            })
                          }
                          onMoveDown={(q) =>
                            moveQuestionDown(q, {
                              handleCatDown: hook.handleCatDown,
                              handleFieldDown: hook.handleFieldDown,
                            })
                          }
                          onEdit={hook.handleEditField}
                          onDelete={hook.handleDeleteField}
                        />
                        <Grid container pl={3}>
                          {hook.missingFields(question) && (
                            <Typography style={{ color: 'red' }}>
                              *Edit this field to add text for:{' '}
                              {hook.getEmptyLanguages(question)}.
                            </Typography>
                          )}
                        </Grid>
                      </Fragment>
                    );
                  })}
                </Grid>
                <FormEditorFooter
                  onAddCategory={() => {
                    if (languages.length != 0) {
                      hook.setCategoryIndex(null);
                      hook.setCategoryPopupOpen(true);
                    } else {
                      hook.setSubmitError(true);
                      hook.setErrorMessage(
                        'Select at least one language before creating a field'
                      );
                    }
                  }}
                  onSubmit={() => hook.setIsSubmitPopupOpen(true)}
                  submitDisabled={hook.disabled}
                />
              </Grid>
              <SubmitFormTemplateDialog
                open={hook.isSubmitPopupOpen}
                onClose={() => hook.setIsSubmitPopupOpen(false)}
                form={fm}
              />
            </Box>
          </Paper>
        )}
      </Formik>
    </>
  );
};

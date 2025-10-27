import { FormTemplateWithQuestions } from 'src/shared/types/form/formTemplateTypes';
import { Field, Formik } from 'formik';
import { Dispatch, Fragment, SetStateAction } from 'react';
import { initialState, validationSchema } from '../state';
import InfoIcon from '@mui/icons-material/Info';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { PrimaryButton } from 'src/shared/components/Button';
import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { FormQuestions } from './FormQuestions';
import SubmitFormTemplateDialog from './SubmitFormTemplateDialog';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditField from 'src/pages/admin/manageFormTemplates/editFormTemplate/EditField';
import EditCategory from 'src/pages/admin/manageFormTemplates/editFormTemplate/EditCategory';
import { Autocomplete, AutocompleteRenderInputParams } from 'formik-mui';
import { InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { useCustomizedFormWQuestions } from 'src/shared/hooks/forms/useCustomizedFormWQuestions';
interface IProps {
  fm: FormTemplateWithQuestions;
  languages: string[];
  renderState: FormRenderStateEnum;
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestions>>;
  versionError: boolean;
}

export const CustomizedFormWQuestions = ({
  fm,
  languages,
  renderState,
  setForm,
  versionError,
}: IProps) => {
  const hook = useCustomizedFormWQuestions(
    fm,
    languages,
    versionError,
    setForm
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
          hook.setSelectedQuestionIndex(null);
          hook.setCategoryPopupOpen(false);
        }}
        visibilityDisabled={
          hook.categoryIndex != null &&
          fm.questions[hook.categoryIndex].visibleCondition.length > 0
        }
        inputLanguages={
          hook.selectedQuestionIndex !== null
            ? hook.getInputLanguages(hook.questions[hook.selectedQuestionIndex])
            : languages
        }
        setForm={setForm}
        question={
          hook.selectedQuestionIndex !== null
            ? hook.questions[hook.selectedQuestionIndex]
            : undefined
        }
        questionsArr={fm.questions}
        visibilityToggle={
          hook.selectedQuestionIndex !== null &&
          fm.questions[hook.selectedQuestionIndex]?.visibleCondition.length > 0
        }
        categoryIndex={hook.categoryIndex}
      />
      <EditField
        open={hook.editPopupOpen}
        onClose={() => {
          hook.setSelectedQuestionIndex(null);
          hook.setEditPopupOpen(false);
        }}
        inputLanguages={
          hook.selectedQuestionIndex !== null
            ? hook.getInputLanguages(hook.questions[hook.selectedQuestionIndex])
            : languages
        }
        setForm={setForm}
        question={
          hook.selectedQuestionIndex !== null
            ? hook.questions[hook.selectedQuestionIndex]
            : undefined
        }
        questionsArr={fm.questions}
        visibilityDisabled={
          hook.selectedQuestionIndex !== null
            ? hook.questions[hook.selectedQuestionIndex].categoryIndex !==
                null &&
              fm.questions[
                hook.questions[hook.selectedQuestionIndex].categoryIndex ?? 0
              ].visibleCondition.length > 0 // add "?? 0" to suppress null index error
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
          hook.questions.filter(
            (q) => q.categoryIndex === hook.selectedQuestionIndex
          ).length
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
                <Grid item container spacing={3}>
                  <Grid item container xs={12} sm={8}>
                    <h2>Current Form</h2>
                    <div>
                      <Tooltip
                        disableFocusListener
                        disableTouchListener
                        title={
                          <>
                            <EditIcon fontSize="inherit" /> Click to open and
                            edit your field.
                            <br></br>
                            <DeleteIcon fontSize="inherit" /> Click to delete
                            your field.
                            <br></br>
                            <KeyboardArrowUpIcon fontSize="inherit" /> Click to
                            move field up. <br></br>
                            <KeyboardArrowDownIcon fontSize="inherit" /> Click
                            to move field down. <br></br>
                          </>
                        }
                        arrow
                        placement="right">
                        <IconButton>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </Grid>
                  <Grid item container xs={12} sm={4}>
                    <Field
                      key={'view-lang'}
                      value={hook.selectedLanguage}
                      component={Autocomplete}
                      fullWidth
                      name={languages[0]}
                      options={languages}
                      disableClearable={true}
                      onChange={(event: any, value: string) => {
                        hook.setSelectedLanguage(value);
                      }}
                      renderInput={(params: AutocompleteRenderInputParams) => (
                        <>
                          <TextField
                            {...params}
                            name={languages[0]}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {params.InputProps.endAdornment}

                                  <Tooltip
                                    disableFocusListener
                                    disableTouchListener
                                    title={'Select view language for your form'}
                                    arrow>
                                    <InputAdornment position="end">
                                      <IconButton>
                                        <InfoIcon fontSize="small" />
                                      </IconButton>
                                    </InputAdornment>
                                  </Tooltip>
                                </>
                              ),
                            }}
                            helperText={''}
                            label="View Language"
                            variant="outlined"
                            required
                          />
                        </>
                      )}
                    />
                  </Grid>
                </Grid>
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
                      <Fragment key={`rendered-${question.questionIndex}`}>
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
                                  hook.setCategoryIndex(question.questionIndex);
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
                        <Grid
                          container
                          item
                          xs={2}
                          sm={1}
                          xl={0.5}
                          style={{
                            marginLeft: '-20px',
                          }}>
                          <Grid item xs={6}>
                            <IconButton
                              key={`field-up-${question.questionIndex}`}
                              size="small"
                              onClick={(e) => {
                                if (
                                  question.questionType ===
                                  QuestionTypeEnum.CATEGORY
                                ) {
                                  hook.handleCatUp(question);
                                } else {
                                  hook.handleFieldUp(question);
                                }
                              }}>
                              <KeyboardArrowUpIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                          <Grid item xs={6}>
                            <IconButton
                              sx={{
                                marginLeft: '10px',
                              }}
                              key={`edit-field-${question.questionIndex}`}
                              size="small"
                              onClick={(e) => {
                                hook.handleEditField(question);
                              }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                          <Grid item xs={6}>
                            <IconButton
                              key={`field-down-${question.questionIndex}`}
                              size="small"
                              onClick={(e) => {
                                if (
                                  question.questionType ===
                                  QuestionTypeEnum.CATEGORY
                                ) {
                                  hook.handleCatDown(question);
                                } else {
                                  hook.handleFieldDown(question);
                                }
                              }}>
                              <KeyboardArrowDownIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                          <Grid item xs={6}>
                            <IconButton
                              sx={{
                                marginLeft: '10px',
                              }}
                              key={`delete-field-${question.questionIndex}`}
                              size="small"
                              color="error"
                              onClick={(e) => {
                                hook.handleDeleteField(question);
                              }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
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
                <Grid item container justifyContent="space-between">
                  <Grid item xs={6}>
                    <div style={{ display: 'inline-block' }}>
                      <PrimaryButton
                        onClick={() => {
                          if (languages.length != 0) {
                            hook.setCategoryIndex(null);
                            hook.setCategoryPopupOpen(true);
                          } else {
                            hook.setSubmitError(true);
                            hook.setErrorMessage(
                              'Select at least one language before creating a field'
                            );
                          }
                        }}>
                        <AddIcon />
                        {'Add Category'}
                      </PrimaryButton>
                    </div>
                  </Grid>
                  <Grid item container xs={6} justifyContent="flex-end">
                    <PrimaryButton
                      onClick={() => {
                        hook.setIsSubmitPopupOpen(true);
                      }}
                      type="button"
                      disabled={hook.disabled}>
                      {'Submit Template'}
                    </PrimaryButton>
                  </Grid>
                </Grid>
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

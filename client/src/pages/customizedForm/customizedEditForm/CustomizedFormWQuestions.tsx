import { FormTemplateWithQuestions, TQuestion } from 'src/shared/types';
import { Field, Formik } from 'formik';
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useReducer,
  useState,
} from 'react';
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
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditField from 'src/pages/admin/manageFormTemplates/editFormTemplate/EditField';
import { Autocomplete, AutocompleteRenderInputParams } from 'formik-mui';
import { CustomizedFormField } from '../customizedFormHeader/state';
import { TextField } from '@mui/material';
interface IProps {
  fm: FormTemplateWithQuestions;
  languages: string[];
  renderState: FormRenderStateEnum;
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestions>>;
}

export const CustomizedFormWQuestions = ({
  fm,
  languages,
  renderState,
  setForm,
}: IProps) => {
  const questions = fm.questions;
  const classes = useStyles();
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [submitError, setSubmitError] = useState(false);
  const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);
  const [, upd] = useReducer((x) => x + 1, 0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const getInputLanguages = (question: TQuestion) => {
    return question.questionLangVersions.map((item) => item.lang);
  };

  // const [multiSelectValidationFailed, setMultiSelectValidationFailed] =
  //   useState(false);

  const handleEditField = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    setEditPopupOpen(true);
  };

  const handleDeleteField = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    deleteField(question);
  };

  const handleFieldUp = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    moveField(question, true);
  };

  const handleFieldDown = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    moveField(question, false);
  };

  const deleteField = (question: TQuestion) => {
    const index = question.questionIndex;
    questions.splice(index, 1);

    // reset indices
    questions.forEach((q, i) => {
      q.questionIndex = i;
    });

    // update form
    if (setForm) {
      setForm((form) => {
        form.questions = questions;
        return form;
      });
    }
  };

  const moveField = (question: any, up: boolean) => {
    const index = question.questionIndex;
    if (up && index > 0) {
      const temp = questions[index - 1];
      questions[index - 1] = questions[index];
      questions[index] = temp;
      questions[index].questionIndex = index;
      questions[index - 1].questionIndex = index - 1;
      upd();
    } else if (!up && question.questionIndex < questions.length - 1) {
      moveField(questions[index + 1], true);
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
          <Paper>
            <Box p={4} pt={6} m={2}>
              <Grid container spacing={3}>
                <Grid item xs={10}>
                  <h2>Current Form</h2>
                </Grid>
                <Grid item xs={2}>
                  <Field
                    key={'view-lang'}
                    value={selectedLanguage}
                    component={Autocomplete}
                    fullWidth
                    name={CustomizedFormField.lang}
                    options={languages}
                    disableClearable={true}
                    onChange={(event: any, value: string) => {
                      setSelectedLanguage(value);
                      console.log(value);
                    }}
                    renderInput={(params: AutocompleteRenderInputParams) => (
                      <TextField
                        {...params}
                        name={CustomizedFormField.lang}
                        helperText={''}
                        label="View Language"
                        variant="outlined"
                        required
                      />
                    )}
                  />
                </Grid>
                <Divider />
              </Grid>
              <Grid container spacing={3} alignItems="center">
                {FormQuestions({
                  questions: questions,
                  renderState: renderState,
                  language: selectedLanguage,
                  handleAnswers: () => {
                    // pass
                  },
                  setForm: setForm,
                }).map((q, index) => {
                  const question = questions[index];
                  const isQuestionSelected =
                    selectedQuestionIndex === question.questionIndex;
                  return (
                    <Fragment key={`rendered-${question.questionIndex}`}>
                      {q}
                      <Grid
                        container
                        item
                        xs={1}
                        style={{ marginLeft: '-20px' }}>
                        <Grid item xs={6}>
                          <IconButton
                            key={`field-up-${question.questionIndex}`}
                            size="small"
                            onClick={(e) => {
                              handleFieldUp(question);
                            }}>
                            <KeyboardArrowUpIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                        <Grid item xs={6}>
                          <IconButton
                            key={`edit-field-${question.questionIndex}`}
                            size="small"
                            onClick={(e) => {
                              handleEditField(question);
                            }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                        <Grid item xs={6}>
                          <IconButton
                            key={`field-down-${question.questionIndex}`}
                            size="small"
                            onClick={(e) => {
                              handleFieldDown(question);
                            }}>
                            <KeyboardArrowDownIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                        <Grid item xs={6}>
                          <IconButton
                            key={`delete-field-${question.questionIndex}`}
                            size="small"
                            color="error"
                            onClick={(e) => {
                              handleDeleteField(question);
                            }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                      <EditField
                        key={`EditField-popup-${question.questionIndex}`}
                        open={isQuestionSelected && editPopupOpen}
                        onClose={() => {
                          setSelectedQuestionIndex(null);
                          setEditPopupOpen(false);
                        }}
                        inputLanguages={getInputLanguages(question)}
                        setForm={setForm}
                        question={question}
                      />
                    </Fragment>
                  );
                })}
              </Grid>
              <PrimaryButton
                className={classes.right}
                onClick={() => {
                  setIsSubmitPopupOpen(true);
                }}
                type="button"
                disabled={questions.length === 0}>
                {formTitle}
              </PrimaryButton>
              <SubmitFormTemplateDialog
                open={isSubmitPopupOpen}
                onClose={() => setIsSubmitPopupOpen(false)}
                form={fm}
              />
            </Box>
          </Paper>
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

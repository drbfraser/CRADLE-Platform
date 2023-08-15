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
import AddIcon from '@mui/icons-material/Add';
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
  const [individualEditPopupOpen, setIndividualEditPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const getInputLanguages = (question: TQuestion) => {
    return question.questionLangVersions.map((item) => item.lang);
  };

  const handleEditField = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    setIndividualEditPopupOpen(true);
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
      if (q.visibleCondition && q.visibleCondition[0].qidx == index) {
        q.visibleCondition = [];
      }
      q.questionIndex = i;
    });

    // update form
    if (setForm) {
      setForm((form) => {
        form.questions = questions;
        return form;
      });
    }
    upd();
  };

  const moveField = (question: any, up: boolean) => {
    const index = question.questionIndex;
    if (up && index > 0) {
      const temp = questions[index - 1];
      questions[index - 1] = questions[index];
      questions[index] = temp;
      questions[index].questionIndex = index;
      questions[index - 1].questionIndex = index - 1;
      updateVisCond(index - 1, index);
      updateVisCond(index, index - 1);
      upd();
    } else if (!up && question.questionIndex < questions.length - 1) {
      moveField(questions[index + 1], true);
    }
  };

  const updateVisCond = (oldIndex: number, newIndex: number) => {
    questions.forEach((q) => {
      if (q.visibleCondition && q.visibleCondition[0]?.qidx == oldIndex) {
        q.visibleCondition[0].qidx = newIndex;
      }
    });
  };

  return (
    <>
      <APIErrorToast
        open={submitError}
        onClose={() => setSubmitError(false)}
        errorMessage={errorMessage}
      />
      <EditField
        open={editPopupOpen}
        onClose={() => {
          setEditPopupOpen(false);
        }}
        inputLanguages={languages}
        setForm={setForm}
        questionsArr={fm.questions}
        visibilityToggle={false}
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
                        open={isQuestionSelected && individualEditPopupOpen}
                        onClose={() => {
                          setSelectedQuestionIndex(null);
                          setIndividualEditPopupOpen(false);
                        }}
                        inputLanguages={getInputLanguages(question)}
                        setForm={setForm}
                        question={question}
                        questionsArr={questions}
                        visibilityToggle={
                          selectedQuestionIndex != null &&
                          questions[selectedQuestionIndex]?.visibleCondition
                            .length > 0
                        }
                      />
                    </Fragment>
                  );
                })}
                <Grid item xs={12} sm={6}>
                  <PrimaryButton
                    className={classes.button}
                    // disabled={language.length == 0}
                    onClick={() => {
                      if (languages.length != 0) {
                        setEditPopupOpen(true);
                      } else {
                        setSubmitError(true);
                        setErrorMessage(
                          'Select at least one language before creating a field'
                        );
                      }
                    }}>
                    <AddIcon />
                    {'Add Field'}
                  </PrimaryButton>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PrimaryButton
                    className={[classes.right, classes.button].join(' ')}
                    onClick={() => {
                      setIsSubmitPopupOpen(true);
                    }}
                    type="button"
                    disabled={
                      !(fm && fm.questions && fm!.questions!.length > 0)
                    }>
                    {'Submit Template'}
                  </PrimaryButton>
                </Grid>
              </Grid>
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
  button: {
    marginTop: '10px',
    marginLeft: 10,
  },
  right: {
    display: 'flex',
    marginRight: '0px',
    marginLeft: 'auto',
  },
});

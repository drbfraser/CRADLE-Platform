import { FormTemplateWithQuestions, TQuestion } from 'src/shared/types';
import { Field, Formik } from 'formik';
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { initialState, validationSchema } from './state';
import InfoIcon from '@mui/icons-material/Info';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { PrimaryButton } from 'src/shared/components/Button';
import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { FormQuestions } from '../FormQuestions';
import SubmitFormTemplateDialog from './SubmitFormTemplateDialog';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditField from 'src/pages/admin/manageFormTemplates/editFormTemplate/EditField';
import EditCategory from 'src/pages/admin/manageFormTemplates/editFormTemplate/EditCategory';
import { Autocomplete, AutocompleteRenderInputParams } from 'formik-mui';
import {
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import DeleteCategoryDialog from './DeleteCategoryDialog';
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
  const questions = fm.questions;
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [submitError, setSubmitError] = useState(false);
  const [visibilityToggle, setVisibilityToggle] = useState(false);
  const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [, upd] = useReducer((x) => x + 1, 0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [categoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categoryIndex, setCategoryIndex] = useState<number | null>(null);
  const getInputLanguages = (question: TQuestion) => {
    return question.questionLangVersions.map((item) => item.lang);
  };

  const isMobile = useMediaQuery('(max-width:599px)');

  useEffect(() => {
    updateAddedQuestions(languages);
    setSelectedLanguage(languages[0]);
    upd();
  }, [languages]);

  const updateAddedQuestions = (languages: string[]) => {
    questions.forEach((question) => {
      const currentLanguages = question.questionLangVersions.map(
        (version) => version.lang
      );

      // if language is removed
      question.questionLangVersions = question.questionLangVersions.filter(
        (v) => languages.includes(v.lang)
      );

      languages.forEach((language) => {
        // if language is added
        if (!currentLanguages.includes(language)) {
          question.questionLangVersions.push({
            lang: language,
            mcOptions: [],
            questionText: '',
          });
        }
      });
    });
  };

  const handleEditField = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    if (question.questionType == QuestionTypeEnum.CATEGORY) {
      setCategoryIndex(question.categoryIndex);
      setCategoryPopupOpen(true);
    } else {
      setVisibilityToggle(
        selectedQuestionIndex != null &&
          fm.questions[selectedQuestionIndex]?.visibleCondition.length > 0
      );
      setEditPopupOpen(true);
    }
  };

  const handleDeleteOnClose = (confirmed: boolean) => {
    if (selectedQuestionIndex !== null && confirmed) {
      // User clicked OK
      const questionsToDelete = questions.filter(
        (q) =>
          q.categoryIndex === selectedQuestionIndex ||
          q.questionIndex === selectedQuestionIndex
      );
      questionsToDelete.forEach(deleteField);
    }
    setIsDeletePopupOpen(false);
    setSelectedQuestionIndex(null);
  };

  const handleDeleteField = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    setCategoryIndex(null);
    if (question.questionType == QuestionTypeEnum.CATEGORY) {
      setIsDeletePopupOpen(true);
    } else {
      deleteField(question);
    }
  };

  const handleCatUp = (cat: TQuestion) => {
    if (cat.questionIndex === 0) {
      return;
    }
    const prevCatIndex = questions[cat.questionIndex - 1].categoryIndex;
    let prevCatQs: TQuestion[] = [];
    // edge case: prev cat has no qs
    if (prevCatIndex !== null) {
      prevCatQs = questions.filter(
        (q) =>
          q.questionIndex == prevCatIndex || q.categoryIndex == prevCatIndex
      );
    } else {
      prevCatQs.push(questions[cat.questionIndex - 1]);
    }
    const catQs = questions.filter(
      (q) =>
        q.questionIndex == cat.questionIndex ||
        q.categoryIndex == cat.questionIndex
    );
    moveCat(prevCatQs, catQs);
  };

  const handleCatDown = (cat: TQuestion) => {
    const catQs = questions.filter(
      (q) =>
        q.questionIndex == cat.questionIndex ||
        q.categoryIndex == cat.questionIndex
    );
    const nextCatIndex = catQs[catQs.length - 1].questionIndex + 1;
    if (nextCatIndex >= questions.length) {
      return;
    }
    const nextCatQs = questions.filter(
      (q) => q.questionIndex == nextCatIndex || q.categoryIndex == nextCatIndex
    );
    moveCat(catQs, nextCatQs);
  };

  // switches position of 2 categories of questions
  const moveCat = (prevCatQs: TQuestion[], catQs: TQuestion[]) => {
    let insertionIndex = prevCatQs[0].questionIndex;
    prevCatQs.forEach((q) => {
      updateVisCond(q.questionIndex, q.questionIndex + catQs.length);
      q.questionIndex += catQs.length;
      if (q.categoryIndex !== null) {
        q.categoryIndex += catQs.length;
      }
    });
    catQs.forEach((q) => {
      const oldIndex = q.questionIndex;
      updateVisCond(q.questionIndex, q.questionIndex - prevCatQs.length);
      q.questionIndex -= prevCatQs.length;
      if (q.categoryIndex !== null) {
        q.categoryIndex -= prevCatQs.length;
      }
      questions.splice(insertionIndex++, 0, q);
      questions.splice(oldIndex + 1, 1);
    });
    upd();
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
      if (
        q.visibleCondition &&
        q.visibleCondition[0] &&
        q.visibleCondition[0].questionIndex == index
      ) {
        q.visibleCondition = [];
      }
      if (q.categoryIndex && q.categoryIndex > index) {
        q.categoryIndex -= 1;
      }
      updateVisCond(q.questionIndex, i);
      q.questionIndex = i;
    });

    // update form
    if (setForm) {
      setForm((form) => {
        form.questions = questions;
        return form;
      });
    }
    setSelectedQuestionIndex(null);
    upd();
  };

  const moveField = (question: any, up: boolean) => {
    const index = question.questionIndex;
    if (
      up &&
      index > 0 &&
      question.categoryIndex < index - 1 &&
      question.questionType != QuestionTypeEnum.CATEGORY
    ) {
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

  // check if any questions in form have a vis cond dependant on a question whos index changed
  const updateVisCond = (oldIndex: number, newIndex: number) => {
    questions.forEach((q) => {
      if (
        q.visibleCondition &&
        q.visibleCondition[0]?.questionIndex == oldIndex
      ) {
        q.visibleCondition[0].questionIndex = newIndex;
      }
    });
  };

  const getEmptyLanguages = (question: TQuestion) => {
    const emptyLangs = question.questionLangVersions
      .filter((qlv) => qlv.questionText === '')
      .map((qlv) => qlv.lang);

    return emptyLangs.join(', ');
  };

  const missingFields = (question: TQuestion): boolean => {
    const emptyLanguageArray = getEmptyLanguages(question).split(', ');
    return emptyLanguageArray.length !== 0 && emptyLanguageArray[0] !== '';
  };

  const emptyLanguageFieldsInForm = (): boolean => {
    let emptyLangs = false;
    questions.forEach((q) => {
      emptyLangs = emptyLangs || missingFields(q);
    });
    return emptyLangs;
  };

  const disabled =
    !(fm?.questions?.length > 0) || emptyLanguageFieldsInForm() || versionError;

  return (
    <>
      <APIErrorToast
        open={submitError}
        onClose={() => setSubmitError(false)}
        errorMessage={errorMessage}
      />
      <EditCategory
        open={categoryPopupOpen}
        onClose={() => {
          setSelectedQuestionIndex(null);
          setCategoryPopupOpen(false);
        }}
        visibilityDisabled={
          categoryIndex != null &&
          fm.questions[categoryIndex].visibleCondition.length > 0
        }
        inputLanguages={
          selectedQuestionIndex !== null
            ? getInputLanguages(questions[selectedQuestionIndex])
            : languages
        }
        setForm={setForm}
        question={
          selectedQuestionIndex !== null
            ? questions[selectedQuestionIndex]
            : undefined
        }
        questionsArr={fm.questions}
        visibilityToggle={
          selectedQuestionIndex !== null &&
          fm.questions[selectedQuestionIndex]?.visibleCondition.length > 0
        }
        categoryIndex={categoryIndex}
      />
      <EditField
        open={editPopupOpen}
        onClose={() => {
          setSelectedQuestionIndex(null);
          setEditPopupOpen(false);
        }}
        inputLanguages={
          selectedQuestionIndex !== null
            ? getInputLanguages(questions[selectedQuestionIndex])
            : languages
        }
        setForm={setForm}
        question={
          selectedQuestionIndex !== null
            ? questions[selectedQuestionIndex]
            : undefined
        }
        questionsArr={fm.questions}
        visibilityDisabled={
          selectedQuestionIndex !== null
            ? questions[selectedQuestionIndex].categoryIndex !== null &&
              fm.questions[questions[selectedQuestionIndex].categoryIndex ?? 0] // add "?? 0" to suppress null index error
                .visibleCondition.length > 0
            : categoryIndex != null &&
              fm.questions[categoryIndex].visibleCondition.length > 0
        }
        visibilityToggle={visibilityToggle}
        setVisibilityToggle={setVisibilityToggle}
        categoryIndex={categoryIndex}
      />
      <DeleteCategoryDialog
        open={isDeletePopupOpen}
        onClose={handleDeleteOnClose}
        numQuestionsProp={
          questions.filter((q) => q.categoryIndex === selectedQuestionIndex)
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
                      value={selectedLanguage}
                      component={Autocomplete}
                      fullWidth
                      name={languages[0]}
                      options={languages}
                      disableClearable={true}
                      onChange={(event: any, value: string) => {
                        setSelectedLanguage(value);
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
                    questions: questions,
                    renderState: renderState,
                    language: selectedLanguage,
                    handleAnswers: () => {
                      // pass
                    },
                    setForm: setForm,
                  }).map((q, index) => {
                    const question = questions[index];
                    return (
                      <Fragment key={`rendered-${question.questionIndex}`}>
                        {q}
                        {question.questionType == QuestionTypeEnum.CATEGORY && (
                          <Grid
                            id={'add-field-button-container'}
                            item
                            xs={isMobile ? 10 : 1}
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
                                  setCategoryIndex(question.questionIndex);
                                  setVisibilityToggle(
                                    question.visibleCondition.length > 0
                                  );
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
                                  handleCatUp(question);
                                } else {
                                  handleFieldUp(question);
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
                                if (
                                  question.questionType ===
                                  QuestionTypeEnum.CATEGORY
                                ) {
                                  handleCatDown(question);
                                } else {
                                  handleFieldDown(question);
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
                                handleDeleteField(question);
                              }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                        <Grid container pl={3}>
                          {missingFields(question) && (
                            <Typography style={{ color: 'red' }}>
                              *Edit this field to add text for:{' '}
                              {getEmptyLanguages(question)}.
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
                            setCategoryIndex(null);
                            setCategoryPopupOpen(true);
                          } else {
                            setSubmitError(true);
                            setErrorMessage(
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
                        setIsSubmitPopupOpen(true);
                      }}
                      type="button"
                      disabled={disabled}>
                      {'Submit Template'}
                    </PrimaryButton>
                  </Grid>
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

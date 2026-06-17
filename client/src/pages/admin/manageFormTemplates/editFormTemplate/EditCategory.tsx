import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  CancelButton,
  PrimaryButton,
} from '../../../../shared/components/Button';
import * as handlers from './multiFieldComponents/handlers';
import InfoIcon from '@mui/icons-material/Info';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { QCondition } from 'src/shared/types/form/formTypes';
import {
  FormTemplateWithQuestionsV2,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import { QuestionTypeEnum } from 'src/shared/enums';
import EditVisibleCondition from './EditVisibleCondition';
import { capitalize } from 'src/shared/utils';

interface IProps {
  open: boolean;
  onClose: () => void;
  visibilityDisabled: boolean;
  inputLanguages: string[];
  setForm?: Dispatch<SetStateAction<FormTemplateWithQuestionsV2>>;
  question?: TQuestion;
  questionsArr: TQuestion[];
  visibilityToggle: boolean;
  categoryIndex: number | null;
}

const EditCategory = ({
  open,
  onClose,
  visibilityDisabled,
  inputLanguages,
  setForm,
  question,
  questionsArr,
  visibilityToggle,
  categoryIndex,
}: IProps) => {
  // Store as object with language keys
  const [questionText, setQuestionText] = useState<Record<string, string>>({});
  const [fieldChanged, setFieldChanged] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [visibleCondition, setVisibleCondition] = useState<QCondition[]>([]);
  const [enableVisibility, setEnableVisiblity] = useState(visibilityToggle);
  const [isVisCondAnswered, setIsVisCondAnswered] = useState(!visibilityToggle);
  const [areAllFieldsFilled, setAreAllFieldsFilled] = useState(true);

  useEffect(() => {
    // edit field
    if (formDirty) {
      setEnableVisiblity(enableVisibility);
    } else {
      if (question) {
        // Convert questionText to object format
        if (
          question.questionText &&
          typeof question.questionText === 'object'
        ) {
          setQuestionText(question.questionText as Record<string, string>);
        }
        setEnableVisiblity(
          enableVisibility || question.visibleCondition.length > 0
        );
      }
      // create new field
      else {
        setQuestionText({});
        setEnableVisiblity(false);
      }
    }
    setAreAllFieldsFilled(fieldFilled());
  }, [open, setForm, fieldChanged]);

  useEffect(() => {
    setIsVisCondAnswered(!enableVisibility);
  }, [enableVisibility]);

  const getFieldName = (language: string) => {
    return questionText[language.toLowerCase()] ?? '';
  };

  const fieldFilled = () => {
    // All languages must have non-empty strings
    return inputLanguages.every((lang) => {
      const text = questionText[lang.toLowerCase()];
      return typeof text === 'string' && text.trim().length > 0;
    });
  };

  const addFieldToQuestionLangVersions = (
    language: string,
    fieldName: string
  ) => {
    setQuestionText((prev) => ({
      ...prev,
      [language.toLowerCase()]: fieldName,
    }));
  };

  return (
    <>
      <Dialog open={open} maxWidth="lg" fullWidth>
        <DialogTitle>
          <div>
            <Typography variant="h5">
              {question ? 'Edit Category' : 'Create Category'}
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} mt={1}>
            {inputLanguages.map((lang) => (
              <Grid item xs={12} key={lang + '-category-name'}>
                <TextField
                  key={lang + '-field-text'}
                  label={capitalize(lang) + ' Category Name'}
                  required={true}
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={getFieldName(lang)}
                  inputProps={{
                    maxLength: Number.MAX_SAFE_INTEGER,
                  }}
                  onChange={(e) => {
                    addFieldToQuestionLangVersions(lang, e.target.value);
                    setFieldChanged(!fieldChanged);
                    setFormDirty(true);
                  }}
                />
              </Grid>
            ))}
            {questionsArr.some(
              // only include questions that:
              // 1. is not this question
              // 2. are not categories
              // 3. if this question is a category, it is not in this category
              (q) => {
                if (
                  q == question ||
                  q.questionType == QuestionTypeEnum.CATEGORY
                )
                  return false;
                if (question?.questionType !== QuestionTypeEnum.CATEGORY)
                  return true;
                let currCatIndex = q.categoryIndex;
                while (
                  currCatIndex !== null &&
                  questionsArr[currCatIndex] !== undefined
                ) {
                  if (currCatIndex === question.order) return false;
                  currCatIndex = questionsArr[currCatIndex].categoryIndex;
                }
                return true;
              }
            ) && (
              <>
                <Grid item container sm={12} md={10} lg={10}>
                  <FormControlLabel
                    style={{ marginLeft: 0 }}
                    control={
                      <Switch
                        checked={enableVisibility}
                        disabled={visibilityDisabled}
                        onChange={(e) =>
                          handlers.handleVisibilityChange(
                            e,
                            setEnableVisiblity,
                            setFormDirty,
                            setFieldChanged,
                            fieldChanged
                          )
                        }
                        data-testid="conditional-switch"
                      />
                    }
                    label={
                      <FormLabel id="vis-label" style={{ display: 'flex' }}>
                        <Typography variant="h6">
                          Conditional Visibility
                        </Typography>
                        <Tooltip
                          disableFocusListener
                          disableTouchListener
                          title={
                            visibilityDisabled
                              ? 'Cannot edit if parent category already has a visibility condition'
                              : 'Set this field to only appear after a specific field value is entered'
                          }
                          arrow
                          placement="right">
                          <IconButton>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </FormLabel>
                    }
                    labelPlacement="start"
                  />
                </Grid>
                {enableVisibility ? (
                  <Grid item sm={12} md={10} lg={10}>
                    <EditVisibleCondition
                      currVisCond={question?.visibleCondition[0]}
                      disabled={visibilityDisabled}
                      filteredQs={questionsArr.filter((q) => {
                        if (
                          q == question ||
                          q.questionType == QuestionTypeEnum.CATEGORY
                        )
                          return false;
                        if (
                          question?.questionType !== QuestionTypeEnum.CATEGORY
                        )
                          return true;
                        let currCatIndex = q.categoryIndex;
                        while (currCatIndex !== null) {
                          if (currCatIndex === question.order) return false;
                          currCatIndex =
                            questionsArr[currCatIndex].categoryIndex;
                        }
                        return true;
                      })}
                      setVisibleCondition={setVisibleCondition}
                      setIsVisCondAnswered={setIsVisCondAnswered}
                      setFieldChanged={setFieldChanged}
                    />
                  </Grid>
                ) : null}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="button"
            onClick={(e) => {
              setFormDirty(false);
              setEnableVisiblity(false);
              onClose();
            }}>
            Cancel
          </CancelButton>
          <PrimaryButton
            type="submit"
            disabled={!isVisCondAnswered || !areAllFieldsFilled}
            onClick={() => {
              if (setForm) {
                if (question && !enableVisibility) {
                  question.visibleCondition.length = 0;
                }
                setForm((form) => {
                  // edit field
                  if (question) {
                    const questionToUpdate = form.questions.find(
                      (q) => q.order === question.order
                    );
                    if (questionToUpdate) {
                      questionToUpdate.questionText = questionText;
                      questionToUpdate.visibleCondition = enableVisibility
                        ? visibleCondition
                        : [];
                      // children of the edited category must inherit the visibility condition (or lack thereof)
                      const visCondsToUpdate: TQuestion[] = [];
                      form.questions.forEach((q) => {
                        if (q.categoryIndex === null) return;
                        if (q.categoryIndex === questionToUpdate.order) {
                          visCondsToUpdate.push(q);
                          return;
                        }
                        let rootCatIndex: number | null = q.categoryIndex;
                        while (
                          rootCatIndex !== null &&
                          form.questions[rootCatIndex] !== undefined &&
                          form.questions[rootCatIndex].categoryIndex !== null
                        ) {
                          if (q.categoryIndex === questionToUpdate.order) {
                            visCondsToUpdate.push(q);
                            return;
                          }
                          rootCatIndex =
                            form.questions[rootCatIndex]?.categoryIndex ?? null;
                        }
                        if (rootCatIndex === questionToUpdate.order) {
                          visCondsToUpdate.push(q);
                        }
                      });
                      visCondsToUpdate.forEach((q) => {
                        form.questions[q.order].visibleCondition =
                          enableVisibility ? visibleCondition : [];
                      });
                    }
                  }
                  // create new field
                  else {
                    form.questions.push({
                      order: form.questions.length,
                      questionText: questionText,
                      questionType: QuestionTypeEnum.CATEGORY,
                      required: false,
                      allowFutureDates: true,
                      allowPastDates: true,
                      numMin: null,
                      numMax: null,
                      stringMaxLength: null,
                      units: null,
                      visibleCondition: visibleCondition,
                      categoryIndex: categoryIndex,
                      id: undefined,
                      hasCommentAttached: false,
                      questionStringId: undefined,
                      userQuestionId: undefined,
                    });
                  }
                  setVisibleCondition([]);
                  setFormDirty(false);
                  form.questions = [...form.questions];
                  return form;
                });
              }
              onClose();
            }}>
            {'Save'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditCategory;

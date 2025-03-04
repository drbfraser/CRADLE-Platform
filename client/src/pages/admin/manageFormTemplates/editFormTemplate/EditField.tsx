import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Switch,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import {
  CancelButton,
  PrimaryButton,
} from '../../../../shared/components/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  FormTemplateWithQuestions,
  McOption,
  QCondition,
  QuestionLangVersion,
  TQuestion,
} from 'src/shared/types';
import { QuestionTypeEnum } from 'src/shared/enums';
import EditVisibleCondition from './EditVisibleCondition';
import MultiChoice from './multiFieldComponents/MultiChoiceField';
import MultiSelect from './multiFieldComponents/MultiSelectField';
import * as handlers from './multiFieldComponents/handlers';

interface IProps {
  open: boolean;
  onClose: () => void;
  inputLanguages: string[];
  setForm?: Dispatch<SetStateAction<FormTemplateWithQuestions>>;
  question?: TQuestion;
  questionsArr: TQuestion[];
  visibilityDisabled: boolean;
  visibilityToggle: boolean;
  setVisibilityToggle: Dispatch<SetStateAction<boolean>>;
  categoryIndex: number | null;
}

interface FieldTypes {
  [key: string]: {
    value: string;
    label: string;
    type: QuestionTypeEnum;
    render: () => JSX.Element;
  };
}

const EditField = ({
  open,
  onClose,
  inputLanguages,
  setForm,
  question,
  questionsArr,
  visibilityDisabled,
  visibilityToggle,
  setVisibilityToggle,
  categoryIndex,
}: IProps) => {
  const [fieldType, setFieldType] = useState<string>('category');
  const [questionId, setQuestionId] = useState<string>('');
  const [numChoices, setNumChoices] = useState<number>(0);
  const [questionLangVersions, setQuestionLangversions] = useState<
    QuestionLangVersion[]
  >([] as QuestionLangVersion[]);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [visibleCondition, setVisibleCondition] = useState<QCondition[]>([]);
  const [fieldChanged, setFieldChanged] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [isRequired, setIsRequired] = useState(question?.required ?? false);
  const [allowPastDates, setAllowPastDates] = useState(
    question?.allowPastDates ?? true
  );
  const [allowFutureDates, setAllowFutureDates] = useState(
    question?.allowFutureDates ?? true
  );
  const [isVisCondAnswered, setIsVisCondAnswered] = useState(!visibilityToggle);
  const [editVisCondKey, setEditVisCondKey] = useState(0);
  const [stringMaxLines, setStringMaxLines] = useState<
    string | number | null | undefined
  >('');
  const [isNumOfLinesRestricted, setIsNumOfLinesRestricted] = useState(
    Number(stringMaxLines) > 0
  );
  const [numMin, setNumMin] = useState<number | null>(null);
  const [numMax, setNumMax] = useState<number | null>(null);

  const removeAllMultChoices = () => {
    questionLangVersions.forEach((qLangVersion) => {
      if (qLangVersion.mcOptions) {
        qLangVersion.mcOptions = [] as McOption[];
      }
    });
  };

  const getMcOptionValue = (language: string, index: number) => {
    let mcOptionValue = '';
    const qlangVersion = questionLangVersions.find(
      (qlv) => qlv.lang == language
    );
    if (qlangVersion) {
      if (index < qlangVersion.mcOptions.length) {
        mcOptionValue = qlangVersion.mcOptions[index].opt;
      }
    }

    return mcOptionValue;
  };

  const fieldTypes: FieldTypes = {
    category: {
      value: 'category',
      label: 'Subcategory',
      type: QuestionTypeEnum.CATEGORY,
      render: () => <></>,
    },
    number: {
      value: 'number',
      label: 'Number',
      type: QuestionTypeEnum.INTEGER,
      render: () => (
        <Grid container spacing={1} direction="column">
          <Grid item>
            <TextField
              label="Minimum Value"
              type="number"
              variant="outlined"
              fullWidth
              size="small"
              value={numMin ?? ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : null;
                setNumMin(value);
                if (numMax !== null && value !== null && value > numMax) {
                  // ensure max >= min
                  setNumMax(value);
                }
              }}
              sx={{ ml: 3.2, pr: 3.2, mb: 1 }}
            />
          </Grid>
          <Grid item>
            <TextField
              label="Maximum Value"
              type="number"
              variant="outlined"
              fullWidth
              size="small"
              value={numMax ?? ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : null;
                setNumMax(value);
                if (numMin !== null && value !== null && value < numMin) {
                  // ensure min <= max
                  setNumMin(value);
                }
              }}
              sx={{ ml: 3.2, pr: 3.2, mb: 1 }}
            />
          </Grid>
        </Grid>
      ),
    },
    text: {
      value: 'text',
      label: 'Text',
      type: QuestionTypeEnum.STRING,
      render: () => (
        <Grid item>
          <FormControlLabel
            style={{ marginLeft: 0 }}
            control={
              <Switch
                checked={isNumOfLinesRestricted}
                onChange={(e) =>
                  handlers.handleIsNumOfLinesRestrictedChange(
                    e,
                    setIsNumOfLinesRestricted,
                    setFormDirty,
                    setFieldChanged,
                    setStringMaxLines,
                    fieldChanged
                  )
                }
                data-testid="lines-num-restriction-switch"
              />
            }
            label={
              <FormLabel
                id="lines-num-restriction-label"
                style={{ display: 'flex' }}>
                <Typography variant="h6">Restrict Max Lines</Typography>
                <Tooltip
                  disableFocusListener
                  disableTouchListener
                  title={'Restrict the number of lines for this field'}
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

          {isNumOfLinesRestricted && (
            <Grid item>
              <TextField
                label={`Max Lines`}
                required={isNumOfLinesRestricted}
                variant="outlined"
                fullWidth
                size="small"
                defaultValue={
                  !isNaN(Number(stringMaxLines)) && Number(stringMaxLines) > 0
                    ? Number(stringMaxLines)
                    : ``
                }
                inputProps={{
                  maxLength: Number.MAX_SAFE_INTEGER,
                  min: 0,
                }}
                onChange={(e) => {
                  setStringMaxLines(e.target.value);
                  setFieldChanged(!fieldChanged);
                  setFormDirty(true);
                }}
              />
            </Grid>
          )}
        </Grid>
      ),
    },
    mult_choice: {
      value: 'mult_choice',
      label: 'Multiple Choice',
      type: QuestionTypeEnum.MULTIPLE_CHOICE,
      render: () => (
        <MultiChoice
          numChoices={numChoices}
          inputLanguages={inputLanguages}
          fieldChanged={fieldChanged}
          questionLangVersions={questionLangVersions}
          setNumChoices={setNumChoices}
          setQuestionLangversions={setQuestionLangversions}
          setFieldChanged={setFieldChanged}
          setFormDirty={setFormDirty}
          getMcOptionValue={getMcOptionValue}
        />
      ),
    },
    mult_select: {
      value: 'mult_select',
      label: 'Multi Select',
      type: QuestionTypeEnum.MULTIPLE_SELECT,
      render: () => (
        <MultiSelect
          numChoices={numChoices}
          inputLanguages={inputLanguages}
          fieldChanged={fieldChanged}
          questionLangVersions={questionLangVersions}
          setNumChoices={setNumChoices}
          setQuestionLangversions={setQuestionLangversions}
          setFieldChanged={setFieldChanged}
          setFormDirty={setFormDirty}
          getMcOptionValue={getMcOptionValue}
        />
      ),
    },
    date: {
      value: 'date',
      label: 'Date',
      type: QuestionTypeEnum.DATE,
      render: () => (
        <>
          {/*TODO: Handle what is displayed when Date field type is selected*/}
        </>
      ),
    },
  };

  const getFieldType = (questionType: QuestionTypeEnum) => {
    const fType = Object.keys(fieldTypes).find(
      (fieldType) => fieldTypes[fieldType].type === questionType
    );
    return fType ? fType : '';
  };

  useEffect(() => {
    setIsVisCondAnswered(!visibilityToggle);
    setFieldChanged(!fieldChanged);
  }, [visibilityToggle]);

  const areAllFieldsFilled = (): boolean => {
    let areAllNamesFilled = true;
    questionLangVersions.forEach((qLangVersion) => {
      areAllNamesFilled = areAllNamesFilled && qLangVersion.questionText != '';
    });
    let areAllMcOptionFilled = true;
    let isMaxLinesAllowedFilled = true;
    const isFieldTypeChosen = fieldType.trim() != '';

    if (fieldType == 'mult_choice' || fieldType == 'mult_select') {
      questionLangVersions.forEach((qLangVersion) => {
        areAllNamesFilled =
          areAllNamesFilled && qLangVersion.questionText.trim() != '';
        if (qLangVersion.mcOptions.length == 0) {
          areAllMcOptionFilled = false;
        } else {
          qLangVersion.mcOptions.forEach((option) => {
            areAllMcOptionFilled =
              areAllMcOptionFilled && option.opt.trim() != '';
          });
        }
      });
    } else if (fieldType == 'text' && isNumOfLinesRestricted) {
      isMaxLinesAllowedFilled =
        !isNaN(Number(stringMaxLines)) && Number(stringMaxLines) > 0;
    }

    const nonMultiChoiceCheck =
      areAllNamesFilled && isFieldTypeChosen && isVisCondAnswered;

    let ret = false;
    if (fieldType == 'mult_choice' || fieldType == 'mult_select') {
      ret = nonMultiChoiceCheck && areAllMcOptionFilled;
    } else if (fieldType == 'text') {
      ret = nonMultiChoiceCheck && isMaxLinesAllowedFilled;
    } else {
      ret = nonMultiChoiceCheck;
    }
    return ret;
  };

  const getQLangVersionsCopy = (
    questionLangVersions: QuestionLangVersion[]
  ): QuestionLangVersion[] => {
    const qLangVersions = [] as QuestionLangVersion[];
    questionLangVersions.forEach((qLangVersion) => {
      const mcOptions = [] as McOption[];
      if (qLangVersion.mcOptions) {
        qLangVersion.mcOptions.forEach((mcOption) => {
          mcOptions.push({
            mcId: mcOption.mcId,
            opt: mcOption.opt,
          });
        });
      }
      qLangVersions.push({
        lang: qLangVersion.lang,
        mcOptions: mcOptions,
        questionText: qLangVersion.questionText,
      });
    });
    return qLangVersions;
  };

  useEffect(() => {
    if (
      categoryIndex !== null &&
      questionsArr[categoryIndex].visibleCondition.length > 0
    ) {
      setVisibleCondition(questionsArr[categoryIndex].visibleCondition);
    } else setVisibleCondition([]);
    // force re-render of EditVisibleCondition after updating the visibility condition
    setEditVisCondKey(editVisCondKey + 1);
  }, [open]);

  useEffect(() => {
    // edit field
    if (formDirty) {
      setFieldType(fieldType);
      setQuestionId(questionId);
    } else {
      if (question) {
        setFieldType(getFieldType(question.questionType));
        setQuestionId(question.id ? question.id : '');
        setVisibilityToggle(
          visibilityToggle || question.visibleCondition.length > 0
        );
        const qlvCopy = getQLangVersionsCopy(question.langVersions);
        setQuestionLangversions(qlvCopy);
        if (qlvCopy.length > 0) {
          setNumChoices(qlvCopy[0].mcOptions.length);
        }
        setIsRequired(question.required);
        setAllowFutureDates(question.allowFutureDates);
        setAllowPastDates(question.allowPastDates);
        setStringMaxLines(question.stringMaxLines);
        setIsNumOfLinesRestricted(question.stringMaxLines ? true : false);
        setNumMin(question.numMin ?? null);
        setNumMax(question.numMax ?? null);
      }
      // create new field
      else {
        setFieldType('category');
        setQuestionId('');
        setQuestionLangversions([]);
        setNumChoices(0);
        setIsRequired(false);
        setAllowFutureDates(true);
        setAllowPastDates(true);
        setIsNumOfLinesRestricted(false);
        setStringMaxLines(null);
        setNumMin(null);
        setNumMax(null);
      }
    }
    // Check if all fields are filled
    // Enable/disable save button based on filled fields
    setIsSaveDisabled(!areAllFieldsFilled());
  }, [open, setForm, fieldChanged]);

  const getFieldName = (language: string) => {
    let fName = '';
    if (question) {
      const qLangVersion = question.langVersions.find(
        (version) => version.lang === language
      );
      if (qLangVersion) {
        fName = qLangVersion.questionText;
      }
    }
    return fName;
  };

  const addFieldToQuestionLangVersions = (
    language: string,
    fieldName: string
  ) => {
    const qLangVersions: QuestionLangVersion[] = questionLangVersions;

    const newQLangVersion = {
      lang: language,
      mcOptions: [] as McOption[],
      questionText: fieldName,
    };

    const qLangVersion = qLangVersions.find((q) => q.lang === language);

    if (!qLangVersion) {
      qLangVersions.push(newQLangVersion);
    } else {
      const i = qLangVersions.indexOf(qLangVersion);
      qLangVersions[i].questionText = fieldName;
    }
    setQuestionLangversions(qLangVersions);
  };

  return (
    <>
      <Dialog open={open} maxWidth="lg" fullWidth>
        <DialogTitle>
          <div>
            <Typography variant="h5">
              {question ? 'Edit Field' : 'Create Field'}
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item container xs={12}>
              <FormLabel id="field-details-label">
                <Typography variant="h6">Field Details</Typography>
              </FormLabel>
              <div>
                <Tooltip
                  disableFocusListener
                  disableTouchListener
                  title={
                    <>
                      <b>Field Text:</b> Enter a heading for your form question
                      <br />
                      <b>Question ID:</b> Enter a value to uniquely identify
                      this field
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
            {inputLanguages.map((lang) => (
              <Grid item xs={12} key={lang + '-field-text'}>
                <TextField
                  key={lang + '-field-text'}
                  label={lang + ' Field Text'}
                  required={true}
                  variant="outlined"
                  fullWidth
                  multiline
                  size="small"
                  defaultValue={getFieldName(lang)}
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

            {fieldType != 'category' && (
              <Grid item xs={12}>
                <TextField
                  label={'Question ID'}
                  key={'question-id'}
                  variant="outlined"
                  fullWidth
                  multiline
                  defaultValue={question && question.id ? question.id : ''}
                  size="small"
                  inputProps={{
                    maxLength: Number.MAX_SAFE_INTEGER,
                  }}
                  onChange={(e) => {
                    setQuestionId(e.target.value);
                    setFieldChanged(!fieldChanged);
                    setFormDirty(true);
                  }}
                />
              </Grid>
            )}
            <Grid item container sm={12} md={2} lg={2}>
              <FormLabel id="field-type-label">
                <Typography variant="h6">Field Type</Typography>
              </FormLabel>
              <div>
                <Tooltip
                  disableFocusListener
                  disableTouchListener
                  title={
                    'Select a type for your field. For Multiple Choice and Multi Select options, Add Options to your field as you would like them to appear on your form.'
                  }
                  arrow
                  placement="right">
                  <IconButton>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </Grid>
            <Grid item sm={12} md={10} lg={10}>
              <RadioGroup
                aria-labelledby="field-type-label"
                name="field-type-group"
                row
                value={fieldType}
                onChange={(e) => {
                  handlers.handleRadioChange(
                    e,
                    setFieldType,
                    setFieldChanged,
                    setFormDirty,
                    fieldChanged
                  );
                  setFieldChanged(!fieldChanged);
                  setFormDirty(true);
                }}>
                {Object.values(fieldTypes).map((field) => (
                  <FormControlLabel
                    key={field.label}
                    value={field.value}
                    control={<Radio />}
                    label={field.label}
                  />
                ))}
              </RadioGroup>
            </Grid>
            {fieldType ? fieldTypes[fieldType].render() : null}
            {questionsArr.some(
              // only include questions that:
              // 1. is not this question
              // 2. are not categories
              (q) =>
                q != question && q.questionType != QuestionTypeEnum.CATEGORY
            ) && (
              <>
                <Grid item container sm={12} md={10} lg={10}>
                  <FormControlLabel
                    style={{ marginLeft: 0 }}
                    control={
                      <Switch
                        checked={visibilityToggle}
                        disabled={visibilityDisabled}
                        onChange={(e) =>
                          handlers.handleVisibilityChange(
                            e,
                            setVisibilityToggle,
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
                              ? 'Cannot edit if category already has a visibility condition'
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
                <Grid item sm={12} md={10} lg={10}>
                  {visibilityToggle ? (
                    <EditVisibleCondition
                      key={editVisCondKey}
                      currVisCond={
                        visibleCondition[0] ??
                        question?.visibleCondition[0] ??
                        null
                      }
                      disabled={visibilityDisabled}
                      filteredQs={questionsArr.filter(
                        // must use exact same filter criteria as above
                        (q) =>
                          q != question &&
                          q.questionType != QuestionTypeEnum.CATEGORY
                      )}
                      setVisibleCondition={setVisibleCondition}
                      setIsVisCondAnswered={setIsVisCondAnswered}
                      setFieldChanged={setFieldChanged}
                    />
                  ) : null}
                </Grid>
              </>
            )}
          </Grid>
          {fieldType != 'category' && (
            <Grid item>
              <FormControlLabel
                style={{ marginLeft: 0 }}
                control={
                  <Switch
                    checked={isRequired}
                    onChange={(e) =>
                      handlers.handleRequiredChange(
                        e,
                        setIsRequired,
                        setFormDirty,
                        setFieldChanged,
                        fieldChanged
                      )
                    }
                    data-testid="required-switch"
                  />
                }
                label={
                  <FormLabel id="required-label" style={{ display: 'flex' }}>
                    <Typography variant="h6">Required</Typography>
                    <Tooltip
                      disableFocusListener
                      disableTouchListener
                      title={'Make this field required in your form'}
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
          )}
          {fieldType == 'date' && (
            <Grid item>
              <FormControlLabel
                style={{ marginLeft: 0, marginTop: 5 }}
                control={
                  <Switch
                    checked={allowPastDates}
                    onChange={(e) =>
                      handlers.handleAllowPastDatesChange(
                        e,
                        setAllowPastDates,
                        setFormDirty,
                        setFieldChanged,
                        fieldChanged
                      )
                    }
                    data-testid="allow-past-dates-switch"
                  />
                }
                label={
                  <FormLabel
                    id="allow-past-dates-label"
                    style={{ display: 'flex' }}>
                    <Typography variant="h6">Allow Past Dates</Typography>
                    <Tooltip
                      disableFocusListener
                      disableTouchListener
                      title={'Allow past dates in your form'}
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
          )}
          {fieldType == 'date' && (
            <Grid item>
              <FormControlLabel
                style={{ marginLeft: 0, marginTop: 5 }}
                control={
                  <Switch
                    checked={allowFutureDates}
                    onChange={(e) =>
                      handlers.handleAllowFutureDatesChange(
                        e,
                        setAllowFutureDates,
                        setFormDirty,
                        setFieldChanged,
                        fieldChanged
                      )
                    }
                    data-testid="allow-future-dates-switch"
                  />
                }
                label={
                  <FormLabel
                    id="allow-future-dates-label"
                    style={{ display: 'flex' }}>
                    <Typography variant="h6">Allow Future Dates</Typography>
                    <Tooltip
                      disableFocusListener
                      disableTouchListener
                      title={'Allow future dates in your form'}
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
          )}
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="button"
            onClick={(e) => {
              setFormDirty(false);
              setNumChoices(0);
              setVisibilityToggle(false);
              onClose();
            }}>
            Cancel
          </CancelButton>
          <PrimaryButton
            type="submit"
            disabled={isSaveDisabled}
            onClick={() => {
              if (setForm) {
                if (fieldType != 'mult_choice' && fieldType != 'mult_select') {
                  removeAllMultChoices();
                }
                if (question && !visibilityToggle) {
                  question.visibleCondition.length = 0;
                }
                setForm((form) => {
                  let finalStringMaxLines = null;
                  const stringMaxLinesInt = Number(stringMaxLines);
                  if (!isNaN(stringMaxLinesInt) && stringMaxLinesInt > 0) {
                    finalStringMaxLines = stringMaxLinesInt;
                  }
                  // edit field
                  if (question) {
                    const questionToUpdate = form.questions.find(
                      (q) => q.questionIndex === question.questionIndex
                    );
                    if (questionToUpdate) {
                      questionToUpdate.id = questionId;
                      questionToUpdate.langVersions = questionLangVersions;
                      questionToUpdate.questionType =
                        fieldTypes[fieldType].type;
                      questionToUpdate.visibleCondition = visibilityToggle
                        ? visibleCondition
                        : [];
                      questionToUpdate.required = isRequired;
                      questionToUpdate.allowFutureDates = allowFutureDates;
                      questionToUpdate.allowPastDates = allowPastDates;
                      questionToUpdate.stringMaxLines = finalStringMaxLines;
                      questionToUpdate.numMin = numMin;
                      questionToUpdate.numMax = numMax;
                    }
                  }
                  // create new field
                  else {
                    let indexToInsert = form.questions.length;
                    if (categoryIndex != null) {
                      for (
                        let i = categoryIndex + 1;
                        i < form.questions.length;
                        i++
                      ) {
                        if (form.questions[i].categoryIndex != categoryIndex) {
                          indexToInsert = i;
                          break;
                        }
                      }
                    }
                    form.questions.splice(indexToInsert, 0, {
                      questionIndex: indexToInsert,
                      langVersions: questionLangVersions,
                      questionType: fieldTypes[fieldType].type,
                      required: isRequired,
                      allowFutureDates: allowFutureDates,
                      allowPastDates: allowPastDates,
                      numMin: numMin,
                      numMax: numMax,
                      stringMaxLength: null,
                      stringMaxLines: finalStringMaxLines,
                      units: null,
                      visibleCondition: visibleCondition,
                      categoryIndex: categoryIndex,
                      id: questionId,
                    });
                    form.questions.forEach((q, index) => {
                      if (q.categoryIndex && q.categoryIndex >= indexToInsert) {
                        q.categoryIndex += 1;
                      }
                      q.questionIndex = index;
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
            {/* disabled={isSubmitting || !isValid}>*/}
            {/* {creatingNew ? 'Create' : 'Save'}*/}
            {'Save'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditField;

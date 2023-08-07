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
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
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

interface IProps {
  open: boolean;
  onClose: () => void;
  inputLanguages: string[];
  setForm?: Dispatch<SetStateAction<FormTemplateWithQuestions>>;
  question?: TQuestion;
  questionsArr: TQuestion[];
  visibilityToggle: boolean;
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
  visibilityToggle,
}: IProps) => {
  const [fieldType, setFieldType] = useState<string>('category');
  const [questionId, setQuestionId] = useState<string>('');
  const [numChoices, setNumChoices] = useState<number>(0);
  const [questionLangVersions, setQuestionLangversions] = useState<
    QuestionLangVersion[]
  >([] as QuestionLangVersion[]);
  const [visibleCondition, setVisibleCondition] = useState<QCondition[]>([]);
  const [enableVisibility, setEnableVisiblity] = useState(visibilityToggle);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [fieldChanged, setFieldChanged] = useState(false);
  const [formDirty, setFormDirty] = useState(false);

  const handleRemoveMultiChoice = (index: number) => {
    const qLangVersions: QuestionLangVersion[] = questionLangVersions;

    inputLanguages.forEach((lang) => {
      const qLangVersion = qLangVersions.find((qlv) => qlv.lang == lang);
      if (qLangVersion) {
        const i = qLangVersions.indexOf(qLangVersion);
        if (i >= 0) {
          // remove option
          qLangVersions[i].mcOptions.splice(index, 1);

          // reset indices for options
          qLangVersions[i].mcOptions.forEach((mcOption, mci) => {
            mcOption.mcid = mci;
          });
        }
      }
    });

    const newNumChoices = numChoices - 1;
    setNumChoices(newNumChoices);
    setQuestionLangversions(qLangVersions);
  };

  const handleAddChoice = () => {
    const newNumChoices = numChoices + 1;
    inputLanguages.map((lang) => {
      handleMultiChoiceOptionChange(lang, '', numChoices);
    });
    setNumChoices(newNumChoices);
  };

  const handleMultiChoiceOptionChange = (
    language: string,
    option: string,
    index: number
  ) => {
    const qLangVersions: QuestionLangVersion[] = questionLangVersions;

    const newQLangVersion = {
      lang: language,
      mcOptions: [] as McOption[],
      questionText: '',
    };

    const qLangVersion = qLangVersions.find((q) => q.lang === language);

    if (!qLangVersion) {
      newQLangVersion.mcOptions.push({
        mcid: index,
        opt: option,
      });
      qLangVersions.push(newQLangVersion);
    } else {
      const i = qLangVersions.indexOf(qLangVersion);
      if (index < qLangVersions[i].mcOptions.length) {
        qLangVersions[i].mcOptions[index].opt = option;
      } else {
        qLangVersions[i].mcOptions.push({
          mcid: index,
          opt: option,
        });
      }
    }
    setQuestionLangversions(qLangVersions);
  };

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
      label: 'Category',
      type: QuestionTypeEnum.CATEGORY,
      render: () => <></>,
    },
    number: {
      value: 'number',
      label: 'Number',
      type: QuestionTypeEnum.INTEGER,
      render: () => (
        <>
          {/*TODO: Handle what is displayed when Number field type is selected*/}
        </>
      ),
    },
    text: {
      value: 'text',
      label: 'Text',
      type: QuestionTypeEnum.STRING,
      render: () => (
        <>
          {/*TODO: Handle what is displayed when Text field type is selected*/}
        </>
      ),
    },
    mult_choice: {
      value: 'mult_choice',
      label: 'Multiple Choice',
      type: QuestionTypeEnum.MULTIPLE_CHOICE,
      render: () => (
        <Grid item container spacing={3}>
          <Grid item xs={12}>
            <PrimaryButton
              type="button"
              onClick={(e) => {
                handleAddChoice();
                setFieldChanged(!fieldChanged);
                setFormDirty(true);
              }}>
              {'Add Choice'}
            </PrimaryButton>
          </Grid>
          <Grid item container spacing={3}>
            {Array.from(Array(numChoices).keys()).map((_, index) => (
              <Grid item xs={12} key={`option-${index}`}>
                <Grid item container spacing={3}>
                  <Grid item xs={10} sm={6} md={2}>
                    <FormLabel id="field-type-label">
                      <Typography variant="h6">Option {index + 1}</Typography>
                    </FormLabel>
                  </Grid>
                  <Grid item xs={2} sm={6} md={10}>
                    <IconButton
                      key={`remove-option-${index + 1}`}
                      color="error"
                      onClick={(e) => {
                        handleRemoveMultiChoice(index);
                        setFieldChanged(!fieldChanged);
                        setFormDirty(true);
                      }}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
                <Grid item container spacing={3}>
                  {inputLanguages.map((lang) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={`${lang}-mult-choice-option-${index + 1}-body`}>
                      <TextField
                        key={`${lang}-field-name-mult-choice-option-${
                          index + 1
                        }`}
                        label={`${lang} Option ${index + 1}`}
                        required={true}
                        variant="outlined"
                        value={getMcOptionValue(lang, index)}
                        fullWidth
                        multiline
                        size="small"
                        inputProps={{
                          // TODO: Determine what types of input restrictions we should have for multiple choice option
                          maxLength: Number.MAX_SAFE_INTEGER,
                        }}
                        onChange={(e) => {
                          handleMultiChoiceOptionChange(
                            lang,
                            e.target.value,
                            index
                          );
                          setFieldChanged(!fieldChanged);
                          setFormDirty(true);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
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

  const handleRadioChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setFieldType(event.target.value);
    setFieldChanged(!fieldChanged);
    setFormDirty(true);
  };

  const handleVisibilityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEnableVisiblity(event.target.checked);
  };

  const getFieldType = (questionType: QuestionTypeEnum) => {
    const fType = Object.keys(fieldTypes).find(
      (fieldType) => fieldTypes[fieldType].type === questionType
    );
    return fType ? fType : '';
  };

  const areAllFieldsFilled = (): boolean => {
    const isQuestionIdFilled = questionId.trim() != '';
    let areAllNamesFilled = true;
    questionLangVersions.forEach((qLangVersion) => {
      areAllNamesFilled = areAllNamesFilled && qLangVersion.questionText != '';
    });
    let areAllMcOptionFilled = true;
    const isFieldTypeChosen = fieldType.trim() != '';
    let isVisCondAnswered = undefined;

    if (enableVisibility) {
      if (visibleCondition[0]) {
        isVisCondAnswered = visibleCondition[0].answers != null ? true : false;
      } else {
        isVisCondAnswered = false;
      }
    } else {
      isVisCondAnswered = true;
    }

    if (fieldType == 'mult_choice') {
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
    }

    const nonMultiChoiceCheck =
      isQuestionIdFilled &&
      areAllNamesFilled &&
      isFieldTypeChosen &&
      isVisCondAnswered;

    return fieldType == 'mult_choice'
      ? nonMultiChoiceCheck && areAllMcOptionFilled
      : nonMultiChoiceCheck;
  };

  const getQLangVersionsCopy = (
    questionLangVersions: QuestionLangVersion[]
  ): QuestionLangVersion[] => {
    const qLangVersions = [] as QuestionLangVersion[];
    questionLangVersions.forEach((qLangVersion) => {
      const mcOptions = [] as McOption[];
      qLangVersion.mcOptions.forEach((mcOption) => {
        mcOptions.push({
          mcid: mcOption.mcid,
          opt: mcOption.opt,
        });
      });
      qLangVersions.push({
        lang: qLangVersion.lang,
        mcOptions: mcOptions,
        questionText: qLangVersion.questionText,
      });
    });
    return qLangVersions;
  };

  useEffect(() => {
    // edit field
    if (formDirty) {
      setFieldType(fieldType);
      setQuestionId(questionId);
      setQuestionLangversions(questionLangVersions);
    } else {
      if (question) {
        setFieldType(getFieldType(question.questionType));
        setQuestionId(question.questionId ? question.questionId : '');
        setEnableVisiblity(question.visibleCondition.length > 0 ? true : false);
        setQuestionLangversions(
          getQLangVersionsCopy(question.questionLangVersions)
        );
        if (questionLangVersions.length > 0) {
          setNumChoices(questionLangVersions[0].mcOptions.length);
        }
      }
      // create new field
      else {
        setFieldType('category');
        setQuestionId('');
        setQuestionLangversions([]);
        setNumChoices(0);
        setEnableVisiblity(false);
      }
    }
    // Check if all fields are filled
    // Enable/disable save button based on filled fields
    setIsSaveDisabled(!areAllFieldsFilled());
  }, [open, setForm, fieldChanged]);

  const getFieldName = (language: string) => {
    let fName = '';
    if (question) {
      const qLangVersion = question.questionLangVersions.find(
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
            <Typography variant="h5">Create Field</Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormLabel id="field-details-label">
                <Typography variant="h6">Field Details</Typography>
              </FormLabel>
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
            <Grid item xs={12}>
              <TextField
                label={'Question ID'}
                key={'question-id'}
                required={true}
                variant="outlined"
                fullWidth
                multiline
                defaultValue={
                  question && question.questionId ? question.questionId : ''
                }
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
            <Grid item sm={12} md={2} lg={2}>
              <FormLabel id="field-type-label">
                <Typography variant="h6">Field Type</Typography>
              </FormLabel>
            </Grid>
            <Grid item sm={12} md={10} lg={10}>
              <RadioGroup
                aria-labelledby="field-type-label"
                name="field-type-group"
                row
                value={fieldType}
                onChange={(e) => {
                  handleRadioChange(e);
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
            {questionsArr.filter(
              (question) => question.questionType != QuestionTypeEnum.CATEGORY
            ).length > 0 ? (
              <>
                <Grid item sm={12} md={10} lg={10}>
                  <FormControlLabel
                    style={{ marginLeft: 0 }}
                    control={
                      <Switch
                        checked={enableVisibility}
                        onChange={handleVisibilityChange}
                      />
                    }
                    label={
                      <FormLabel id="vis-label">
                        <Typography variant="h6">
                          Conditional Visibility
                        </Typography>
                      </FormLabel>
                    }
                    labelPlacement="start"
                  />
                </Grid>
                <Grid item sm={12} md={10} lg={10}>
                  {enableVisibility ? (
                    <EditVisibleCondition
                      currQuestion={question}
                      questionsArr={questionsArr}
                      setVisibleCondition={setVisibleCondition}
                    />
                  ) : null}
                </Grid>
              </>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <CancelButton
            type="button"
            onClick={(e) => {
              setFormDirty(false);
              setNumChoices(0);
              onClose();
            }}>
            Cancel
          </CancelButton>
          <PrimaryButton
            type="submit"
            disabled={isSaveDisabled}
            onClick={() => {
              if (setForm) {
                if (fieldType != 'mult_choice') {
                  removeAllMultChoices();
                }
                setForm((form) => {
                  // edit field
                  if (question) {
                    const questionToUpdate = form.questions.find(
                      (q) => q.questionIndex === question.questionIndex
                    );
                    if (questionToUpdate) {
                      questionToUpdate.questionId = questionId;
                      questionToUpdate.questionLangVersions =
                        questionLangVersions;
                      questionToUpdate.questionType =
                        fieldTypes[fieldType].type;
                      questionToUpdate.visibleCondition = enableVisibility
                        ? visibleCondition
                        : [];
                    }
                  }
                  // create new field
                  else {
                    form.questions.push({
                      questionIndex: form.questions.length,
                      questionLangVersions: questionLangVersions,
                      questionType: fieldTypes[fieldType].type,
                      required: false,
                      numMin: null,
                      numMax: null,
                      stringMaxLength: null,
                      units: null,
                      visibleCondition: visibleCondition,
                      categoryIndex: null,
                      questionId: questionId,
                    });
                  }
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

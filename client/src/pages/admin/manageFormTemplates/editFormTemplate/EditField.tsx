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
  Stack,
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
import { Dispatch, SetStateAction } from 'react';
import {
  FormTemplateWithQuestions,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import { QuestionTypeEnum } from 'src/shared/enums';
import EditVisibleCondition from './EditVisibleCondition';
import MultiChoice from './multiFieldComponents/MultiChoiceField';
import MultiSelect from './multiFieldComponents/MultiSelectField';
import * as handlers from './multiFieldComponents/handlers';
import CustomNumberField from 'src/shared/components/Form/CustomNumberField';
import { useEditField } from 'src/shared/hooks/forms/useEditField';
import { capitalize } from 'src/shared/utils';

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
        <Grid item xs={12} sm={6}>
          <Stack direction={'row'} gap={2}>
            <CustomNumberField
              label="Minimum Value"
              id="number-field-min"
              value={hook.numMin}
              onChange={(event) => {
                const value = Number.parseFloat(event.target.value);
                hook.setNumMin(value);
                hook.validateNumberFields(value, hook.numMax);
              }}
            />
            <CustomNumberField
              label="Maximum Value"
              id="number-field-max"
              value={hook.numMax}
              onChange={(event) => {
                const value = Number.parseFloat(event.target.value);
                hook.setNumMax(value);
                hook.validateNumberFields(hook.numMin, value);
              }}
            />
          </Stack>
          {hook.validationError && (
            <Typography color="error" variant="body2">
              {hook.validationError}
            </Typography>
          )}
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
                checked={hook.isNumOfLinesRestricted}
                onChange={(e) =>
                  handlers.handleIsNumOfLinesRestrictedChange(
                    e,
                    hook.setIsNumOfLinesRestricted,
                    hook.setFormDirty,
                    hook.setFieldChanged,
                    hook.setStringMaxLines,
                    hook.fieldChanged
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

          {hook.isNumOfLinesRestricted && (
            <Grid item>
              <TextField
                label={`Max Lines`}
                required={hook.isNumOfLinesRestricted}
                variant="outlined"
                fullWidth
                size="small"
                defaultValue={
                  !isNaN(Number(hook.stringMaxLines)) &&
                  Number(hook.stringMaxLines) > 0
                    ? Number(hook.stringMaxLines)
                    : ``
                }
                inputProps={{
                  maxLength: Number.MAX_SAFE_INTEGER,
                  min: 0,
                }}
                onChange={(e) => {
                  hook.setStringMaxLines(e.target.value);
                  hook.setFieldChanged(!hook.fieldChanged);
                  hook.setFormDirty(true);
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
          numChoices={hook.numChoices}
          inputLanguages={inputLanguages}
          fieldChanged={hook.fieldChanged}
          mcOptions={hook.mcOptions}
          setNumChoices={hook.setNumChoices}
          setMcOptions={hook.setMcOptions}
          setFieldChanged={hook.setFieldChanged}
          setFormDirty={hook.setFormDirty}
          getMcOptionValue={hook.getMcOptionValue}
          updateMcOption={hook.updateMcOption}
        />
      ),
    },
    mult_select: {
      value: 'mult_select',
      label: 'Multi Select',
      type: QuestionTypeEnum.MULTIPLE_SELECT,
      render: () => (
        <MultiSelect
          numChoices={hook.numChoices}
          inputLanguages={inputLanguages}
          fieldChanged={hook.fieldChanged}
          mcOptions={hook.mcOptions}
          setNumChoices={hook.setNumChoices}
          setMcOptions={hook.setMcOptions}
          setFieldChanged={hook.setFieldChanged}
          setFormDirty={hook.setFormDirty}
          getMcOptionValue={hook.getMcOptionValue}
          updateMcOption={hook.updateMcOption}
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

  const hook = useEditField({
    question,
    visibilityToggle,
    setForm,
    fieldTypes,
    open,
    setVisibilityToggle,
    categoryIndex,
    questionsArr,
    inputLanguages,
  });

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
                  key={capitalize(lang) + '-field-text'}
                  label={capitalize(lang) + ' Field Text'}
                  required={true}
                  variant="outlined"
                  fullWidth
                  multiline
                  size="small"
                  defaultValue={hook.getFieldName(lang)}
                  inputProps={{
                    maxLength: Number.MAX_SAFE_INTEGER,
                  }}
                  onChange={(e) => {
                    hook.addFieldToQuestionLangVersions(lang, e.target.value);
                    hook.setFieldChanged(!hook.fieldChanged);
                    hook.setFormDirty(true);
                  }}
                />
              </Grid>
            ))}

            {hook.fieldType != 'category' && (
              <Grid item xs={12}>
                <TextField
                  label={'Question ID'}
                  key={'question-id'}
                  variant="outlined"
                  fullWidth
                  multiline
                  value={
                    question && hook.userQuestionId ? hook.userQuestionId : ''
                  }
                  size="small"
                  inputProps={{
                    maxLength: Number.MAX_SAFE_INTEGER,
                  }}
                  onChange={(e) => {
                    hook.setUserQuestionId(e.target.value);
                    hook.setFieldChanged(!hook.fieldChanged);
                    hook.setFormDirty(true);
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
                value={hook.fieldType}
                onChange={(e) => {
                  handlers.handleRadioChange(
                    e,
                    hook.setFieldType,
                    hook.setFieldChanged,
                    hook.setFormDirty,
                    hook.fieldChanged
                  );
                  hook.setFieldChanged(!hook.fieldChanged);
                  hook.setFormDirty(true);
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
            {hook.fieldType ? fieldTypes[hook.fieldType].render() : null}
            {questionsArr.some(
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
                            hook.setFormDirty,
                            hook.setFieldChanged,
                            hook.fieldChanged
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
                      key={hook.editVisCondKey}
                      currVisCond={
                        hook.visibleCondition[0] ??
                        question?.visibleCondition[0] ??
                        null
                      }
                      disabled={visibilityDisabled}
                      filteredQs={questionsArr.filter(
                        (q) =>
                          q != question &&
                          q.questionType != QuestionTypeEnum.CATEGORY
                      )}
                      setVisibleCondition={hook.setVisibleCondition}
                      setIsVisCondAnswered={hook.setIsVisCondAnswered}
                      setFieldChanged={hook.setFieldChanged}
                    />
                  ) : null}
                </Grid>
              </>
            )}
          </Grid>
          {hook.fieldType != 'category' && (
            <Grid item>
              <FormControlLabel
                style={{ marginLeft: 0 }}
                control={
                  <Switch
                    checked={hook.isRequired}
                    onChange={(e) =>
                      handlers.handleRequiredChange(
                        e,
                        hook.setIsRequired,
                        hook.setFormDirty,
                        hook.setFieldChanged,
                        hook.fieldChanged
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
          {hook.fieldType == 'date' && (
            <Grid item>
              <FormControlLabel
                style={{ marginLeft: 0, marginTop: 5 }}
                control={
                  <Switch
                    checked={hook.allowPastDates}
                    onChange={(e) =>
                      handlers.handleAllowPastDatesChange(
                        e,
                        hook.setAllowPastDates,
                        hook.setFormDirty,
                        hook.setFieldChanged,
                        hook.fieldChanged
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
          {hook.fieldType == 'date' && (
            <Grid item>
              <FormControlLabel
                style={{ marginLeft: 0, marginTop: 5 }}
                control={
                  <Switch
                    checked={hook.allowFutureDates}
                    onChange={(e) =>
                      handlers.handleAllowFutureDatesChange(
                        e,
                        hook.setAllowFutureDates,
                        hook.setFormDirty,
                        hook.setFieldChanged,
                        hook.fieldChanged
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
            onClick={() => {
              hook.setFormDirty(false);
              hook.setNumChoices(0);
              setVisibilityToggle(false);
              onClose();
            }}>
            Cancel
          </CancelButton>
          <PrimaryButton
            type="submit"
            disabled={hook.isSaveDisabled || hook.validationError !== null}
            onClick={() => {
              if (setForm) {
                setForm((form) => {
                  let finalStringMaxLines = null;
                  const stringMaxLinesInt = Number(hook.stringMaxLines);
                  if (!isNaN(stringMaxLinesInt) && stringMaxLinesInt > 0) {
                    finalStringMaxLines = stringMaxLinesInt;
                  }

                  // Determine final mcOptions based on field type
                  const finalMcOptions =
                    hook.fieldType === 'mult_choice' ||
                    hook.fieldType === 'mult_select'
                      ? hook.mcOptions
                      : [];

                  // edit field
                  if (question) {
                    const questionToUpdate = form.questions.find(
                      (q) => q.order === question.order
                    );
                    if (questionToUpdate) {
                      questionToUpdate.id = hook.questionId;
                      questionToUpdate.questionText = hook.questionText;
                      questionToUpdate.questionType =
                        fieldTypes[hook.fieldType].type;
                      questionToUpdate.visibleCondition = visibilityToggle
                        ? hook.visibleCondition
                        : [];
                      questionToUpdate.required = hook.isRequired;
                      questionToUpdate.allowFutureDates = hook.allowFutureDates;
                      questionToUpdate.allowPastDates = hook.allowPastDates;
                      questionToUpdate.stringMaxLines = finalStringMaxLines;
                      questionToUpdate.numMin = hook.numMin;
                      questionToUpdate.numMax = hook.numMax;
                      questionToUpdate.mcOptions = finalMcOptions;
                      // Only set questionStringId to undefined if text changed
                      if (hook.questionTextChanged) {
                        questionToUpdate.questionStringId = undefined;
                      }
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
                      order: indexToInsert,
                      questionText: hook.questionText,
                      questionType: fieldTypes[hook.fieldType].type,
                      required: hook.isRequired,
                      allowFutureDates: hook.allowFutureDates,
                      allowPastDates: hook.allowPastDates,
                      numMin: hook.numMin,
                      numMax: hook.numMax,
                      stringMaxLength: null,
                      stringMaxLines: finalStringMaxLines,
                      units: null,
                      visibleCondition: visibilityToggle
                        ? hook.visibleCondition
                        : [],
                      categoryIndex: hook.categoryIndex,
                      id: hook.questionId,
                      mcOptions: finalMcOptions,
                    } as TQuestion);
                    form.questions.forEach((q, index) => {
                      if (q.categoryIndex && q.categoryIndex >= indexToInsert) {
                        q.categoryIndex += 1;
                      }
                      q.order = index;
                    });
                  }

                  // Reset state after save
                  hook.setVisibleCondition([]);
                  hook.setFormDirty(false);

                  // Return new form with updated questions array
                  return {
                    ...form,
                    questions: [...form.questions],
                  };
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

export default EditField;

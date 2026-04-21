import { QuestionTypeEnum } from 'src/shared/enums';
import { QAnswer } from 'src/shared/types/form/formTypes';
import {
  FormTemplateWithQuestionsV2,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import { Dispatch, Fragment, SetStateAction } from 'react';
import {
  getPrettyDate,
  getPrettyDateTime,
  getTimestampFromStringDate,
} from 'src/shared/utils';
import { CategorySharp } from '@mui/icons-material';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Radio from '@mui/material/Radio';
import { RadioGroup } from '@mui/material';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormRenderStateEnum } from 'src/shared/enums';
import CustomNumberField from 'src/shared/components/Form/CustomNumberField';
import { useFormQuestions } from 'src/shared/hooks/forms/useFormQuestions';

interface IProps {
  questions: TQuestion[];
  renderState: FormRenderStateEnum;
  language: string;
  handleAnswers: (answers: QAnswer[]) => void;
  setForm?: Dispatch<SetStateAction<FormTemplateWithQuestionsV2>>;
  multiSelectValidationFailed?: boolean;
  setDisableSubmit?: (disableSubmit: boolean) => void;
}

export const FormQuestions = ({
  questions,
  renderState,
  language,
  handleAnswers,
  setForm,
  multiSelectValidationFailed,
  setDisableSubmit,
}: IProps) => {
  const hook = useFormQuestions(questions, handleAnswers);
  const languageKey = (language || 'English').toLowerCase();

  const resolveLocalizedText = (
    value?: string | Record<string, string>,
    fallback = ''
  ): string => {
    if (!value) {
      return fallback;
    }

    if (typeof value === 'string') {
      return value;
    }

    return (
      value[languageKey] ?? value.english ?? Object.values(value)[0] ?? fallback
    );
  };

  //currently, only ME(checkboxes need manually added validation, others' validations are handled automatically by formik)
  const generateValidationLine = (
    question: TQuestion,
    answer: QAnswer,
    type: any,
    required: boolean
  ) => {
    if (!multiSelectValidationFailed) {
      return null;
    }
    if (type === QuestionTypeEnum.MULTIPLE_SELECT) {
      if (!answer.val!.length) {
        return (
          <>
            <Typography
              variant="overline"
              style={{ color: '#FF0000', fontWeight: 600 }}>
              {' '}
              (Must Select At Least One Option !)
            </Typography>
          </>
        );
      } else {
        return null;
      }
    } else {
      console.log('INVALID QUESTION TYPE!!');
      return null;
    }
  };

  const generateHtmlForQuestion = (
    question: TQuestion,
    answer: QAnswer,
    renderState: FormRenderStateEnum
  ) => {
    if (hook.isQuestion(question) && !answer) {
      return <></>;
    }
    if (!answer) {
      answer = {
        questionIndex:
          typeof question.questionIndex === 'number'
            ? question.questionIndex
            : typeof question.order === 'number'
              ? question.order
              : -1,
        questionType: question.questionType,
        answerType: null,
        val: '',
      };
    }

    const type = question.questionType;
    const qid =
      typeof question.questionIndex === 'number'
        ? question.questionIndex
        : typeof question.order === 'number'
          ? question.order
          : -1;
    const text = resolveLocalizedText(
      question.questionText,
      'Untitled question'
    );

    const mcOptions = question.mcOptions?.map((option) =>
      resolveLocalizedText(option.translations)
    );
    const required = question.required;

    switch (type) {
      case QuestionTypeEnum.CATEGORY:
        return (
          <Grid
            item
            xs={12}
            sm={renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 7 : 12}
            md={renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 5 : 12}>
            <Typography component="h3" variant="h5">
              <CategorySharp fontSize="large" /> &nbsp; {text}
            </Typography>
            <Divider style={{ width: '100%', marginBottom: '10px' }} />
          </Grid>
        );

      case QuestionTypeEnum.MULTIPLE_CHOICE:
        return (
          <Grid
            item
            xs={renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 10 : 12}
            md={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 6
            }
            lg={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 4
            }>
            <FormLabel id={`question_${qid}`}>
              <Typography variant="h6">
                {`${text}`}
                {required ? ' *' : ''}
              </Typography>
            </FormLabel>

            <RadioGroup
              row
              aria-labelledby={`question_${qid}`}
              value={answer.val ? answer.val[0] : ''}
              key={answer.val}
              onChange={function (_, value) {
                hook.updateAnswersByValue(qid, [value]);
              }}>
              {mcOptions?.map((McOption, index) => (
                <FormControlLabel
                  key={index}
                  value={McOption}
                  control={
                    <Radio
                      color="primary"
                      disabled={
                        renderState === FormRenderStateEnum.VIEW ||
                        renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ||
                        renderState === FormRenderStateEnum.VIS_COND_DISABLED
                      }
                    />
                  }
                  label={McOption}
                />
              ))}
            </RadioGroup>
          </Grid>
        );

      case QuestionTypeEnum.MULTIPLE_SELECT:
        return (
          <Grid
            item
            xs={renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 10 : 12}
            md={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 6
            }
            lg={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 4
            }>
            <FormLabel>
              <Typography variant="h6">
                {`${text}${required ? ' *' : ''}`}
                {hook.isQuestion(question)
                  ? generateValidationLine(question, answer, type, required)
                  : null}
              </Typography>
            </FormLabel>
            {mcOptions?.map((mcOption) => (
              <FormControlLabel
                control={
                  <Checkbox
                    value={mcOption}
                    checked={answer.val?.includes(mcOption)}
                    onChange={(event, checked) => {
                      const newValue = checked
                        ? [...answer.val, mcOption]
                        : answer.val.filter((val: any) => val !== mcOption);
                      hook.updateAnswersByValue(qid, newValue);
                    }}
                  />
                }
                label={mcOption}
                key={mcOption} // Use a unique key
                disabled={
                  renderState === FormRenderStateEnum.VIEW ||
                  renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ||
                  renderState === FormRenderStateEnum.VIS_COND_DISABLED
                }
              />
            ))}
          </Grid>
        );

      case QuestionTypeEnum.INTEGER:
        return (
          <Grid
            item
            xs={renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 10 : 12}
            md={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 6
            }
            lg={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 4
            }>
            <CustomNumberField
              value={answer.val}
              label={text}
              variant="outlined"
              required={required}
              fullWidth
              error={!!hook.numberErrors[qid]}
              helperText={hook.numberErrors[qid]}
              suffix={question.units ?? ''}
              onValueChange={(values) => {
                const value = values.floatValue;
                let errorMessage = '';

                if (value !== undefined) {
                  if (
                    question.numMin !== undefined &&
                    question.numMin !== null &&
                    value < question.numMin
                  ) {
                    errorMessage = `Value must be at least ${question.numMin}.`;
                  }
                  if (
                    question.numMax !== undefined &&
                    question.numMax !== null &&
                    value > question.numMax
                  ) {
                    errorMessage = `Value must not exceed ${question.numMax}`;
                  }
                }

                hook.setNumberErrors((prevErrors) => ({
                  ...prevErrors,
                  [qid]: errorMessage,
                }));

                hook.updateAnswersByValue(qid, value);
              }}
              disabled={
                renderState === FormRenderStateEnum.VIEW ||
                renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ||
                renderState === FormRenderStateEnum.VIS_COND_DISABLED
              }
              slotProps={{
                input: {
                  endAdornment: Boolean(question.units) &&
                    Boolean(question.units!.trim().length > 0) && (
                      <InputAdornment position="end">
                        {question.units}
                      </InputAdornment>
                    ),
                },
              }}
            />
          </Grid>
        );

      case QuestionTypeEnum.STRING: {
        const helperText = hook.stringMaxLinesError[qid]
          ? 'Exceeds maximum number of lines'
          : question.stringMaxLines
            ? `Maximum ${question.stringMaxLines} line(s) allowed`
            : '';
        return (
          <Grid
            item
            xs={renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 10 : 12}
            md={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 6
            }
            lg={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 4
            }>
            <TextField
              label={text}
              value={answer.val ?? ''}
              required={required}
              variant="outlined"
              fullWidth
              disabled={
                renderState === FormRenderStateEnum.VIEW ||
                renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ||
                renderState === FormRenderStateEnum.VIS_COND_DISABLED
              }
              multiline
              helperText={helperText}
              error={hook.stringMaxLinesError[qid]}
              inputProps={{
                maxLength:
                  question.stringMaxLength! > 0
                    ? question.stringMaxLength
                    : Number.MAX_SAFE_INTEGER,
              }}
              onChange={(event: any) => {
                const inputValue = event.target.value;
                const lines = inputValue.split(/\r*\n/);
                const exceedsMaxLines = question.stringMaxLines
                  ? lines.length > question.stringMaxLines
                  : false;

                // Using new array because setStringMaxLinesError does not update the state immediately
                const nextErrors = [...hook.stringMaxLinesError];
                nextErrors[qid] = exceedsMaxLines;
                hook.setStringMaxLinesError(nextErrors);

                // Checking if any of the values in stringMaxLinesError is set to true
                // If so, setDisableSubmit to true
                if (setDisableSubmit) {
                  setDisableSubmit(
                    Object.values(nextErrors).some((value) => value === true)
                  );
                }
                //it is originally a string type!! need transfer
                if (!exceedsMaxLines) {
                  hook.updateAnswersByValue(qid, inputValue);
                }
              }}
            />
          </Grid>
        );
      }
      case QuestionTypeEnum.DATETIME:
        return (
          <Grid
            item
            xs={renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 10 : 12}
            md={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 6
            }
            lg={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 4
            }>
            <TextField
              label={text}
              value={answer.val ? getPrettyDateTime(answer.val) : ''}
              fullWidth
              disabled={
                renderState === FormRenderStateEnum.VIEW ||
                renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ||
                renderState === FormRenderStateEnum.VIS_COND_DISABLED
              }
              required={required}
              variant="outlined"
              type="datetime-local"
              inputProps={{ step: 1 }}
              placeholder="YYYY/MM/DD hh:mm:ss"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event: any) => {
                const timestamp = getTimestampFromStringDate(
                  event.target.value
                );
                hook.updateAnswersByValue(qid, timestamp);
              }}
            />
          </Grid>
        );

      case QuestionTypeEnum.DATE:
        return (
          <Grid
            item
            xs={renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 10 : 12}
            md={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 6
            }
            lg={
              renderState === FormRenderStateEnum.VIS_COND ||
              renderState === FormRenderStateEnum.VIS_COND_DISABLED
                ? 12
                : 4
            }>
            <TextField
              label={text}
              value={answer.val ? getPrettyDate(answer.val) : ''}
              fullWidth
              disabled={
                renderState === FormRenderStateEnum.VIEW ||
                renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ||
                renderState === FormRenderStateEnum.VIS_COND_DISABLED
              }
              required={required}
              variant="outlined"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event: any) => {
                const timestamp = getTimestampFromStringDate(
                  event.target.value
                );
                hook.updateAnswersByValue(qid, timestamp);
              }}
              inputProps={{
                ...(!question.allowFutureDates
                  ? { max: hook.getCurrentDate() }
                  : {}),
                ...(!question.allowPastDates
                  ? { min: hook.getCurrentDate() }
                  : {}),
              }}
            />
          </Grid>
        );
      default:
        console.log('INVALID QUESTION TYPE!!');
        return <></>;
    }
  };

  const generateHtmlForQuestions = (
    questions: TQuestion[],
    answers: QAnswer[],
    renderState: FormRenderStateEnum
  ) => {
    return questions.map((question: TQuestion, index) => {
      const qid =
        typeof question.questionIndex === 'number'
          ? question.questionIndex
          : typeof question.order === 'number'
            ? question.order
            : index;
      return (
        <Fragment key={qid}>
          {hook.isQuestion(question) && question.shouldHidden
            ? null
            : generateHtmlForQuestion(question, answers[index], renderState)}
        </Fragment>
      );
    });
  };

  return generateHtmlForQuestions(questions, hook.answers, renderState);
};

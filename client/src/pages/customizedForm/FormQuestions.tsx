import {
  AnswerTypeEnum,
  QRelationEnum,
  QuestionTypeEnum,
} from 'src/shared/enums';
import {
  FormTemplateWithQuestions,
  McOption,
  QAnswer,
  QCondition,
  Question,
  TQuestion,
} from 'src/shared/types';
import { Field } from 'formik';
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
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

const getCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  let month: number | string = today.getMonth() + 1;
  let day: number | string = today.getDate();

  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }

  return `${year}-${month}-${day}`;
};

interface IProps {
  questions: Question[] | TQuestion[];
  renderState: FormRenderStateEnum;
  language: string;
  handleAnswers: (answers: QAnswer[]) => void;
  setForm?: Dispatch<SetStateAction<FormTemplateWithQuestions>>;
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
  const [answers, setAnswers] = useState<QAnswer[]>([]);
  const [stringMaxLinesError, setStringMaxLinesError] = useState<boolean[]>([]);
  const [numberErrors, setNumberErrors] = useState<{ [key: number]: string }>(
    {}
  );

  const isQuestion = (x: any): x is Question => {
    if (x) {
      return 'questionText' in x;
    }
    return false;
  };

  const isQuestionArr = (x: any): x is Question[] => {
    if (x && x[0]) {
      return 'questionText' in x[0];
    }
    return false;
  };

  const handleNumericTypeVisCondition = (
    parentAnswer: QAnswer,
    condition: QCondition
  ): boolean => {
    switch (condition.relation) {
      case QRelationEnum.EQUAL_TO:
        return Number(parentAnswer.val) === Number(condition.answers.number);
      case QRelationEnum.SMALLER_THAN:
        return Number(parentAnswer.val) < Number(condition.answers.number);
      case QRelationEnum.LARGER_THAN:
        return Number(parentAnswer.val) > Number(condition.answers.number);
      case QRelationEnum.CONTAINS:
        return String(parentAnswer.val).includes(
          String(condition.answers.number)
        );
      default:
        return true;
    }
  };

  useEffect(() => {
    const getValuesFromIDs = (
      question: Question,
      mcIdArray: number[] | undefined
    ): string[] => {
      const res: string[] = [];

      const mcOptions: McOption[] = question.mcOptions ?? [];
      mcIdArray?.forEach((optionIndex) => {
        res.push(mcOptions[optionIndex].opt);
      });

      return res;
    };

    const getAnswerFromQuestion = (question: Question): QAnswer => {
      const answer: QAnswer = {
        questionIndex: question.questionIndex,
        questionType: null,
        answerType: null,
        val: null,
      };

      answer.questionType = question.questionType;

      switch (question.questionType) {
        case QuestionTypeEnum.MULTIPLE_CHOICE:
        case QuestionTypeEnum.MULTIPLE_SELECT:
          answer.answerType = AnswerTypeEnum.MC_ID_ARRAY;
          answer.val = getValuesFromIDs(question, question.answers?.mcIdArray);
          break;

        case QuestionTypeEnum.INTEGER:
        case QuestionTypeEnum.DATE:
        case QuestionTypeEnum.DATETIME:
          answer.answerType = AnswerTypeEnum.NUM;
          answer.val = question.answers?.number ?? null;
          break;

        case QuestionTypeEnum.STRING:
          answer.answerType = AnswerTypeEnum.TEXT;
          answer.val = question.answers?.text ?? null;
          break;

        case QuestionTypeEnum.CATEGORY:
          answer.answerType = AnswerTypeEnum.CATEGORY;
          answer.val = null;
          break;

        default:
          console.log(question.questionType);
          console.log('NOTE: INVALID QUESTION TYPE!!');
      }

      return answer;
    };

    if (isQuestionArr(questions)) {
      const getAnswers = (questions: Question[]) =>
        questions.map((question: Question) => getAnswerFromQuestion(question));

      const answers: QAnswer[] = getAnswers(questions);
      updateQuestionsConditionHidden(questions, answers);
      setAnswers(answers);
      handleAnswers(answers);
    }
  }, [questions]);

  function updateAnswersByValue(index: number, newValue: any) {
    if (isQuestionArr(questions)) {
      const ans = [...answers];
      ans.forEach((a) => {
        if (a.questionIndex === index) {
          a.val = newValue;
        }
      });
      updateQuestionsConditionHidden(questions, ans);
      setAnswers(ans);
      handleAnswers(ans);
    }
  }

  const updateQuestionsConditionHidden = (
    questions: Question[],
    answers: QAnswer[]
  ) => {
    questions.forEach((question) => {
      question.shouldHidden =
        question.visibleCondition?.length !== 0 &&
        question.visibleCondition.some((condition: QCondition) => {
          const parentQuestion = questions[condition.questionIndex];
          const parentAnswer: QAnswer = answers[parentQuestion.questionIndex];

          if (!parentAnswer.val) {
            return true;
          }

          let isConditionMet = true;
          switch (parentQuestion.questionType) {
            // TODO: This does not work. The multiple choice and multiple select questions do not
            //       save properly in the QCondition object type
            case QuestionTypeEnum.MULTIPLE_CHOICE:
            case QuestionTypeEnum.MULTIPLE_SELECT:
              // switch (condition.relation) {
              //   case QRelationEnum.EQUAL_TO:
              //     isConditionMet =
              //       condition.answers.mcIdArray!.length > 0 &&
              //       parentAnswer.val?.length > 0 &&
              //       parentAnswer.val?.length ===
              //         condition.answers.mcIdArray?.length &&
              //       condition.answers.mcIdArray!.every((item) =>
              //         parentAnswer.val?.includes(
              //           parentQuestion.mcOptions[item].opt
              //         )
              //       );
              //     break;
              // }
              break;
            case QuestionTypeEnum.STRING:
              switch (condition.relation) {
                case QRelationEnum.EQUAL_TO:
                  isConditionMet = parentAnswer.val === condition.answers.text;
                  break;
                case QRelationEnum.SMALLER_THAN:
                  if (!condition.answers.text) {
                    isConditionMet = false;
                    break;
                  }
                  isConditionMet = parentAnswer.val < condition.answers.text;
                  break;
                case QRelationEnum.LARGER_THAN:
                  if (!condition.answers.text) {
                    isConditionMet = false;
                    break;
                  }
                  isConditionMet = parentAnswer.val > condition.answers.text;
                  break;
                case QRelationEnum.CONTAINS:
                  isConditionMet = parentAnswer.val.includes(
                    condition.answers.text
                  );
                  break;
              }
              break;
            case QuestionTypeEnum.INTEGER:
              isConditionMet = handleNumericTypeVisCondition(
                parentAnswer,
                condition
              );
              break;
            case QuestionTypeEnum.DATE:
              isConditionMet = handleNumericTypeVisCondition(
                parentAnswer,
                condition
              );
              break;
            case QuestionTypeEnum.DATETIME:
              isConditionMet = handleNumericTypeVisCondition(
                parentAnswer,
                condition
              );
              break;
          }

          return !isConditionMet;
        });
    });
  };

  //currently, only ME(checkboxes need manually added validation, others' validations are handled automatically by formik)
  const generateValidationLine = (
    question: Question,
    answer: QAnswer,
    type: any,
    required: boolean
  ) => {
    if (!multiSelectValidationFailed) {
      return null;
    }
    if (type === QuestionTypeEnum.MULTIPLE_SELECT && !question.shouldHidden) {
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
    question: Question | TQuestion,
    answer: QAnswer,
    renderState: FormRenderStateEnum
  ) => {
    if (isQuestion(question) && !answer) {
      return <></>;
    }
    if (!answer) {
      answer = {
        questionIndex: question.questionIndex,
        questionType: question.questionType,
        answerType: null, //value,text,mc,me,comment
        val: '',
      };
    }

    const type = question.questionType;
    const qid = question.questionIndex;
    const text = isQuestion(question)
      ? question.questionText
      : question.langVersions.find((x) => x.lang == language)?.questionText;
    const mcOptions = isQuestion(question)
      ? question.mcOptions
      : question.langVersions.find((x) => x.lang == language)?.mcOptions;
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
            <FormLabel id={`question_${question.questionIndex}`}>
              <Typography variant="h6">
                {`${text}`}
                {required ? ' *' : ''}
              </Typography>
            </FormLabel>

            <RadioGroup
              row
              aria-labelledby={`question_${question.questionIndex}`}
              value={answer.val ? answer.val[0] : ''}
              key={answer.val}
              onChange={function (_, value) {
                updateAnswersByValue(qid, [value]);
              }}>
              {mcOptions?.map((McOption, index) => (
                <FormControlLabel
                  key={index}
                  value={McOption.opt}
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
                  label={McOption.opt}
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
                {isQuestion(question)
                  ? generateValidationLine(question, answer, type, required)
                  : null}
              </Typography>
            </FormLabel>
            {mcOptions?.map((mcOption) => (
              <FormControlLabel
                control={
                  <Checkbox
                    value={mcOption.opt}
                    checked={answer.val?.includes(mcOption.opt)}
                    onChange={(event, checked) => {
                      const newValue = checked
                        ? [...answer.val, mcOption.opt]
                        : answer.val.filter((val: any) => val !== mcOption.opt);
                      updateAnswersByValue(question.questionIndex, newValue);
                    }}
                  />
                }
                label={mcOption.opt}
                key={mcOption.opt} // Use a unique key
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
              error={!!numberErrors[question.questionIndex]}
              helperText={numberErrors[question.questionIndex]}
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

                setNumberErrors((prevErrors) => ({
                  ...prevErrors,
                  [question.questionIndex]: errorMessage,
                }));
                if (!errorMessage) {
                  updateAnswersByValue(question.questionIndex, value);
                }
              }}
              disabled={
                renderState === FormRenderStateEnum.VIEW ||
                renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ||
                renderState === FormRenderStateEnum.VIS_COND_DISABLED
              }
              min={question.numMin}
              max={question.numMax}
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
        const helperText = stringMaxLinesError[question.questionIndex]
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
            <Field
              label={text}
              component={TextField}
              defaultValue={answer.val ?? ''}
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
              error={stringMaxLinesError[question.questionIndex]}
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
                const nextErrors = [...stringMaxLinesError];
                nextErrors[question.questionIndex] = exceedsMaxLines;
                setStringMaxLinesError(nextErrors);

                // Checking if any of the values in stringMaxLinesError is set to true
                // If so, setDisableSubmit to true
                if (setDisableSubmit) {
                  setDisableSubmit(
                    Object.values(nextErrors).some((value) => value === true)
                  );
                }
                //it is originally a string type!! need transfer
                if (!exceedsMaxLines) {
                  updateAnswersByValue(question.questionIndex, inputValue);
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
            <Field
              label={text}
              component={TextField}
              defaultValue={answer.val ? getPrettyDateTime(answer.val) : null}
              key={answer.val}
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
                updateAnswersByValue(question.questionIndex, timestamp);
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
            <Field
              label={text}
              component={TextField}
              defaultValue={answer.val ? getPrettyDate(answer.val) : null}
              key={answer.val}
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
                updateAnswersByValue(question.questionIndex, timestamp);
              }}
              inputProps={{
                ...(!question.allowFutureDates
                  ? { max: getCurrentDate() }
                  : {}),
                ...(!question.allowPastDates ? { min: getCurrentDate() } : {}),
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
    questions: Question[] | TQuestion[],
    answers: QAnswer[],
    renderState: FormRenderStateEnum
  ) => {
    return questions.map((question: Question | TQuestion, index) => {
      return (
        <Fragment key={question.questionIndex}>
          {isQuestion(question) && question.shouldHidden
            ? null
            : generateHtmlForQuestion(question, answers[index], renderState)}
        </Fragment>
      );
    });
  };

  return generateHtmlForQuestions(questions, answers, renderState);
};

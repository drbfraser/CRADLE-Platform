import { AnswerTypeEnum, QuestionTypeEnum } from 'src/shared/enums';
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

interface IProps {
  questions: Question[] | TQuestion[];
  renderState: FormRenderStateEnum;
  language: string;
  handleAnswers: (answers: QAnswer[]) => void;
  setForm?: Dispatch<SetStateAction<FormTemplateWithQuestions>>;
  multiSelectValidationFailed?: boolean;
}

export const FormQuestions = ({
  questions,
  renderState,
  language,
  handleAnswers,
  setForm,
  multiSelectValidationFailed,
}: IProps) => {
  const [answers, setAnswers] = useState<QAnswer[]>([]);

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

  useEffect(() => {
    const getValuesFromIDs = (
      question: Question,
      mcidArray: number[] | undefined
    ): string[] => {
      const res: string[] = [];

      const mcOptions: McOption[] = question.mcOptions ?? [];
      mcidArray?.forEach((optionIndex) => {
        res.push(mcOptions[optionIndex].opt);
      });

      return res;
    };

    const getAnswerFromQuestion = (question: Question): QAnswer => {
      const answer: QAnswer = {
        qidx: question.questionIndex,
        qtype: null,
        anstype: null,
        val: null,
      };

      answer.qtype = question.questionType;

      switch (question.questionType) {
        case QuestionTypeEnum.MULTIPLE_CHOICE:
        case QuestionTypeEnum.MULTIPLE_SELECT:
          answer.anstype = AnswerTypeEnum.MCID_ARRAY;
          answer.val = getValuesFromIDs(question, question.answers?.mcidArray);
          break;

        case QuestionTypeEnum.INTEGER:
        case QuestionTypeEnum.DATE:
        case QuestionTypeEnum.DATETIME:
          answer.anstype = AnswerTypeEnum.NUM;
          answer.val = question.answers?.number ?? null;
          break;

        case QuestionTypeEnum.STRING:
          answer.anstype = AnswerTypeEnum.TEXT;
          answer.val = question.answers?.text ?? null;
          break;

        case QuestionTypeEnum.CATEGORY:
          answer.anstype = AnswerTypeEnum.CATEGORY;
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
        if (a.qidx === index) {
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
          const parentQuestion = questions[condition.qidx];
          const parentAnswer: QAnswer = answers[parentQuestion.questionIndex];

          if (!parentAnswer.val) {
            return true;
          }

          let isConditionMet = true;
          switch (parentQuestion.questionType) {
            case QuestionTypeEnum.MULTIPLE_CHOICE:
            case QuestionTypeEnum.MULTIPLE_SELECT:
              isConditionMet =
                condition.answers.mcidArray!.length > 0 &&
                parentAnswer.val?.length > 0 &&
                parentAnswer.val?.length ===
                  condition.answers.mcidArray?.length &&
                condition.answers.mcidArray!.every((item) =>
                  parentAnswer.val?.includes(parentQuestion.mcOptions[item].opt)
                );
              break;

            case QuestionTypeEnum.STRING:
              isConditionMet = parentAnswer.val === condition.answers.text;
              break;

            case QuestionTypeEnum.INTEGER:
            case QuestionTypeEnum.DATE:
            case QuestionTypeEnum.DATETIME:
              isConditionMet =
                Number(parentAnswer.val) === Number(condition.answers.number);
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
        qidx: question.questionIndex,
        qtype: question.questionType,
        anstype: null, //value,text,mc,me,comment
        val: '',
      };
    }

    const type = question.questionType;
    const qid = question.questionIndex;
    const text = isQuestion(question)
      ? question.questionText
      : question.questionLangVersions.find((x) => x.lang == language)
          ?.questionText;
    const mcOptions = isQuestion(question)
      ? question.mcOptions
      : question.questionLangVersions.find((x) => x.lang == language)
          ?.mcOptions;
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
            <Field
              label={text}
              component={TextField}
              value={answer.val ?? ''}
              variant="outlined"
              type="number"
              fullWidth
              disabled={
                renderState === FormRenderStateEnum.VIEW ||
                renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ||
                renderState === FormRenderStateEnum.VIS_COND_DISABLED
              }
              required={required}
              InputProps={{
                endAdornment: Boolean(question.units) &&
                  Boolean(question.units!.trim().length > 0) && (
                    <InputAdornment position="end">
                      {question.units}
                    </InputAdornment>
                  ),
                inputProps: {
                  step: 0.01,
                  min:
                    question.numMin || question.numMin === 0
                      ? question.numMin
                      : Number.MIN_SAFE_INTEGER,
                  max:
                    question.numMax || question.numMax === 0
                      ? question.numMax
                      : Number.MAX_SAFE_INTEGER,
                },
              }}
              onChange={(event: any) => {
                updateAnswersByValue(
                  question.questionIndex,
                  event.target.value ? Number(event.target.value) : null
                );
              }}
            />
          </Grid>
        );

      case QuestionTypeEnum.STRING:
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
              inputProps={{
                maxLength:
                  question.stringMaxLength! > 0
                    ? question.stringMaxLength
                    : Number.MAX_SAFE_INTEGER,
              }}
              onChange={(event: any) => {
                //it is originally a string type!! need transfer
                updateAnswersByValue(
                  question.questionIndex,
                  event.target.value
                );
              }}
            />
          </Grid>
        );

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

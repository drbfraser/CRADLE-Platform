import { AnswerTypeEnum, QuestionTypeEnum } from 'src/shared/enums';
import {
  CForm,
  McOption,
  QAnswer,
  QCondition,
  Question,
} from 'src/shared/types';
import { Field, Form, Formik } from 'formik';
import { Fragment, useEffect, useState } from 'react';
import {
  getPrettyDate,
  getPrettyDateTime,
  getTimestampFromStringDate,
} from 'src/shared/utils';
import { initialState, validationSchema } from './state';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@mui/material/Box';
import { CategorySharp } from '@mui/icons-material';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import { PrimaryButton, RedirectButton } from 'src/shared/components/Button';
import Radio from '@mui/material/Radio';
import { RadioGroup } from '@mui/material';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { handleSubmit } from './handlers';
import makeStyles from '@mui/styles/makeStyles';
import { FormRenderStateEnum } from 'src/shared/enums';

interface IProps {
  patientId: string;
  fm: CForm;
  renderState: FormRenderStateEnum;
}

export const CustomizedForm = ({ patientId, fm, renderState }: IProps) => {
  const questions = fm.questions;
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  const [multiSelectValidationFailed, setMultiSelectValidationFailed] =
    useState(false);

  const [answers, setAnswers] = useState<QAnswer[]>([]);
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
    case FormRenderStateEnum.FINISH:
      formTitle = 'Finish Form';
      break;
    default:
      formTitle = 'error!!!!!';
      break;
  }

  const handleMultiSelectValidationFailed = (ValidationFailed: boolean) => {
    setMultiSelectValidationFailed(ValidationFailed);
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

    const getAnswers = (questions: Question[]) =>
      questions.map((question: Question) => getAnswerFromQuestion(question));

    const answers: QAnswer[] = getAnswers(questions);
    updateQuestionsConditionHidden(questions, answers);
    setAnswers(answers);
  }, [questions, setAnswers]);

  const updateQuestionsConditionHidden = (
    questions: Question[],
    answers: QAnswer[]
  ) => {
    questions.forEach((question) => {
      question.shouldHidden =
        question.questionType !== QuestionTypeEnum.CATEGORY &&
        question.visibleCondition?.length !== 0 &&
        question.visibleCondition.some((condition: QCondition) => {
          const parentQuestion: Question = questions[condition.qidx];
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

  function updateAnswersByValue(index: number, newValue: any) {
    const ans = [...answers];
    ans[index].val = newValue;
    updateQuestionsConditionHidden(questions, ans);
    setAnswers(ans);
  }

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
    question: Question,
    answer: QAnswer,
    renderState: FormRenderStateEnum
  ) => {
    if (question.shouldHidden || !answer) {
      return <></>;
    }

    const type = question.questionType;
    const qid = question.questionIndex;
    const required = question.required;

    switch (type) {
      case QuestionTypeEnum.CATEGORY:
        return (
          <Grid item sm={12}>
            <Typography component="h3" variant="h5">
              <CategorySharp fontSize="large" /> &nbsp; {question.questionText}
            </Typography>
            <Divider style={{ width: '100%', marginBottom: '10px' }} />
          </Grid>
        );

      case QuestionTypeEnum.MULTIPLE_CHOICE:
        return (
          <Grid item sm={12} md={6} lg={4}>
            <FormLabel id={`question_${question.questionIndex}`}>
              <Typography variant="h6">
                {`${question.questionText}`}
                {required ? ' *' : ''}
              </Typography>
            </FormLabel>

            <RadioGroup
              row
              aria-labelledby={`question_${question.questionIndex}`}
              value={answer.val ? answer.val[0] : ''}
              onChange={function (_, value) {
                updateAnswersByValue(qid, [value]);
              }}>
              {question.mcOptions.map((McOption, index) => (
                <FormControlLabel
                  key={index}
                  value={McOption.opt}
                  control={
                    <Radio
                      color="primary"
                      disabled={renderState === FormRenderStateEnum.VIEW}
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
          <Grid item sm={12} md={6} lg={4}>
            <FormLabel>
              <Typography variant="h6">
                {`${question.questionText}`}
                {required ? ' *' : ''}
                {generateValidationLine(question, answer, type, required)}
              </Typography>
            </FormLabel>
            {question.mcOptions!.map((McOption, index) => (
              <FormControlLabel
                control={
                  <Checkbox
                    value={McOption.opt}
                    defaultChecked={answer.val?.indexOf(McOption.opt) > -1}
                    onChange={(event, checked) => {
                      if (checked) {
                        const new_val = [...answer.val, event.target.value];
                        updateAnswersByValue(qid, new_val);
                      } else {
                        const original_val = [...answer.val];
                        const i = original_val.indexOf(event.target.value);
                        if (i > -1) {
                          original_val.splice(i, 1);
                        }
                        updateAnswersByValue(qid, original_val);
                      }
                    }}
                  />
                }
                label={McOption.opt}
                key={index}
                disabled={renderState === FormRenderStateEnum.VIEW}
              />
            ))}
          </Grid>
        );

      case QuestionTypeEnum.INTEGER:
        return (
          <Grid item sm={12} md={6} lg={4}>
            <Field
              label={question.questionText}
              component={TextField}
              defaultValue={answer.val ?? ''}
              variant="outlined"
              type="number"
              fullWidth
              disabled={renderState === FormRenderStateEnum.VIEW}
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
                updateAnswersByValue(qid, Number(event.target.value));
              }}
            />
          </Grid>
        );

      case QuestionTypeEnum.STRING:
        return (
          <Grid item sm={12} md={6} lg={4}>
            <Field
              label={question.questionText}
              component={TextField}
              defaultValue={answer.val ?? ''}
              required={required}
              variant="outlined"
              fullWidth
              disabled={renderState === FormRenderStateEnum.VIEW}
              multiline
              inputProps={{
                maxLength:
                  question.stringMaxLength! > 0
                    ? question.stringMaxLength
                    : Number.MAX_SAFE_INTEGER,
              }}
              onChange={(event: any) => {
                //it is originally a string type!! need transfer
                updateAnswersByValue(qid, event.target.value);
              }}
            />
          </Grid>
        );

      case QuestionTypeEnum.DATETIME:
        return (
          <Grid item sm={12} md={6} lg={4}>
            <Field
              label={question.questionText}
              component={TextField}
              defaultValue={answer.val ? getPrettyDateTime(answer.val) : null}
              fullWidth
              disabled={renderState === FormRenderStateEnum.VIEW}
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
                updateAnswersByValue(qid, timestamp);
              }}
            />
          </Grid>
        );

      case QuestionTypeEnum.DATE:
        return (
          <Grid item sm={12} md={6} lg={4}>
            <Field
              label={question.questionText}
              component={TextField}
              defaultValue={answer.val ? getPrettyDate(answer.val) : null}
              fullWidth
              disabled={renderState === FormRenderStateEnum.VIEW}
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
                updateAnswersByValue(qid, timestamp);
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
    questions: Question[],
    answers: QAnswer[],
    renderState: FormRenderStateEnum
  ) =>
    questions.map((question: Question, index) => {
      return (
        <Fragment key={question.id}>
          {generateHtmlForQuestion(question, answers[index], renderState)}
        </Fragment>
      );
    });

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState as any}
        validationSchema={validationSchema}
        onSubmit={handleSubmit(
          patientId,
          answers,
          setSubmitError,
          handleMultiSelectValidationFailed,
          renderState === FormRenderStateEnum.EDIT,
          fm
        )}>
        {({ isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={4} pt={6} m={2}>
                {renderState === FormRenderStateEnum.FINISH ? (
                  <Grid container spacing={3}>
                    <h2>Current Form</h2>
                    <Divider/>
                  </Grid>
                ) : (
                  <></>
                )}
                <Grid container spacing={3}>
                  {generateHtmlForQuestions(questions, answers, renderState)}
                </Grid>
                {renderState === FormRenderStateEnum.VIEW ? (
                  <RedirectButton
                    type="button" //This makes the button not trigger onSubmit function
                    url={`/forms/edit/${patientId}/${fm.id}`}
                    className={classes.right}>
                    {formTitle}
                  </RedirectButton>
                ) : renderState === FormRenderStateEnum.FINISH ? (
                  <PrimaryButton
                    className={classes.right}
                    onClick={() => console.log('click finish button')}
                    // TO DO: clicking "finish" saves the form.
                    type="button">
                    {formTitle}
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    className={classes.right}
                    type="submit"
                    disabled={isSubmitting}>
                    {formTitle}
                  </PrimaryButton>
                )}
              </Box>
            </Paper>
          </Form>
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

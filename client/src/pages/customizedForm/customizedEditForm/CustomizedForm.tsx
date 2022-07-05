import { AnswerTypeEnum, QuestionTypeEnum } from 'src/shared/enums';
import { CForm, QAnswer } from 'src/shared/types';
import { Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import {
  getPrettyDateTime,
  getTimestampFromStringDate,
} from 'src/shared/utils';
import { initialState, validationSchema } from './state';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import PollOutlinedIcon from '@material-ui/icons/PollOutlined';
import { Question } from 'src/shared/types';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { handleSubmit } from './handlers';
import { makeStyles } from '@material-ui/core';

interface IProps {
  patientId: string;
  fm: CForm;
  isEditForm: boolean;
}

export const CustomizedForm = ({ patientId, fm, isEditForm }: IProps) => {
  const questions = fm.questions;
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  let [multiSelectValidationFailed] = useState(false);

  const [answers, setAnswers] = useState<QAnswer[]>([]);
  const formTitle = isEditForm ? 'Update Form' : 'Submit Form';

  const setMultiSelectValidationFailed = (ValidationFailed: boolean) => {
    multiSelectValidationFailed = ValidationFailed;
    if (answers.length > 0) {
      setAnswers(answers);
    }
  };

  function getValuesFromIDs(
    question: Question,
    mcidArray: number[] | undefined
  ) {
    if (!mcidArray) {
      return [];
    }
    const res = [];
    let i = 0;
    //0.get this question options [mcOptions array]
    const mcOptions = question.mcOptions ?? [];
    for (i = 0; i < mcidArray.length; i++) {
      //1.get the index of the item in the mcOption array
      const opt_index = mcidArray[i];
      //2.get the mcOption
      const opt_obj = mcOptions[opt_index];
      //3.get the value(string) of the option
      const content = opt_obj.opt;
      //4.push into res | see if needs [...mcOptions[i]]
      res.push(content);
    }
    return res;
  }

  useEffect(() => {
    let i;
    const anss: QAnswer[] = [];
    for (i = 0; i < questions.length; i++) {
      const question = questions[i];
      const ans: QAnswer = {
        qidx: question.questionIndex,
        qtype: null,
        anstype: null,
        val: null,
      };

      if (question.questionType === QuestionTypeEnum.MULTIPLE_CHOICE) {
        ans.qtype = QuestionTypeEnum.MULTIPLE_CHOICE;
        ans.anstype = AnswerTypeEnum.MCID_ARRAY;
        if (
          question.answers?.mcidArray &&
          question.answers?.mcidArray.length > 0
        ) {
          ans.val = getValuesFromIDs(question, question.answers?.mcidArray);
        } else {
          ans.val = [];
        }
      } else if (question.questionType === QuestionTypeEnum.MULTIPLE_SELECT) {
        ans.qtype = QuestionTypeEnum.MULTIPLE_SELECT;
        ans.anstype = AnswerTypeEnum.MCID_ARRAY;
        if (
          question.answers?.mcidArray &&
          question.answers?.mcidArray.length > 0
        ) {
          ans.val = getValuesFromIDs(question, question.answers?.mcidArray);
        } else {
          ans.val = [];
        }
      } else if (question.questionType === QuestionTypeEnum.INTEGER) {
        ans.qtype = QuestionTypeEnum.INTEGER;
        //THE FOLLOWING TWO FIELDS ARE RELATED
        ans.anstype = AnswerTypeEnum.NUM;
        ans.val = question.answers?.number ?? null;
      } else if (question.questionType === QuestionTypeEnum.DATE) {
        ans.qtype = QuestionTypeEnum.DATE;
        ans.anstype = AnswerTypeEnum.NUM;
        ans.val = question.answers?.number ?? null;
      } else if (question.questionType === QuestionTypeEnum.STRING) {
        ans.qtype = QuestionTypeEnum.STRING;
        ans.anstype = AnswerTypeEnum.TEXT;
        ans.val = question.answers?.text ?? null;
      } else if (question.questionType === QuestionTypeEnum.CATEGORY) {
        ans.qtype = QuestionTypeEnum.CATEGORY;
        ans.anstype = AnswerTypeEnum.CATEGORY;
        ans.val = null;
      } else {
        console.log(question.questionType);
        console.log('NOTE: INVALID QUESTION TYPE!!');
      }
      anss[i] = ans;
    }
    //condition update must be 'after' the initilization of the 'answers'
    updateQuestionsConditionHidden(questions, anss);
    setAnswers(anss);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  function updateQuestionsConditionHidden(
    questions: Question[],
    answers: QAnswer[]
  ) {
    let i;
    for (i = 0; i < questions.length; i++) {
      const question = questions[i];
      question.shouldHidden = false;
      if (question.visibleCondition?.length > 0) {
        question.shouldHidden = true;
        let j;
        for (j = 0; j < question.visibleCondition?.length; j++) {
          const condition = question.visibleCondition[j];
          const parentQidx = condition.qidx;

          const parentAnswer = answers[parentQidx];
          const parentQOptions = questions[parentQidx].mcOptions ?? [];
          if (parentAnswer.val) {
            if (
              questions[parentQidx].questionType ===
                QuestionTypeEnum.MULTIPLE_CHOICE ||
              questions[parentQidx].questionType ===
                QuestionTypeEnum.MULTIPLE_SELECT
            ) {
              if (
                parentAnswer.val?.length > 0 &&
                condition.answers.mcidArray!.length > 0 &&
                parentAnswer.val?.length === condition.answers.mcidArray?.length
              ) {
                //only this type will have an array value in its 'Answer'
                //to see if those two array contains the same items
                let all_equal = true;
                condition.answers.mcidArray!.forEach((item, index) => {
                  //******!!MCID has to be the index of that option!!!!!!!!!******
                  const condition_expected_ans = parentQOptions[item].opt;
                  //those two array are not equal
                  if (parentAnswer.val.indexOf(condition_expected_ans) < 0) {
                    all_equal = false;
                  }
                });
                if (all_equal) {
                  //******IMPORTANT
                  question.shouldHidden = false;
                  continue;
                } else {
                  question.shouldHidden = true;
                  break;
                }
              } else {
                question.shouldHidden = true;
                break;
              }
            } else {
              if (
                questions[parentQidx].questionType ===
                  QuestionTypeEnum.STRING &&
                //!!NOTE: THIS MAY HAVE BUGS!![USE == OR === ???]
                parentAnswer.val === condition.answers.text
              ) {
                question.shouldHidden = false;
              } else if (
                (questions[parentQidx].questionType ===
                  QuestionTypeEnum.INTEGER ||
                  questions[parentQidx].questionType ===
                    QuestionTypeEnum.DATE) &&
                Number(parentAnswer.val) === Number(condition.answers.number)
              ) {
                console.log(parentAnswer.val);
                console.log(condition.answers.number);
                question.shouldHidden = false;
              } else {
                question.shouldHidden = true;
                break;
              }
            }
          }
        }
        //after decide the 'shouldHidden' field, we need to remove the answer from those hidden question, when it appears again, the field should be 'blank'[NO, WE KEEP THE PREVIOUS ANSWERS NOW]
      }
      if (question.questionType === QuestionTypeEnum.CATEGORY) {
        question.shouldHidden = false;
      }
    }
  }

  function updateAnswersByValue(index: number, newValue: any) {
    const ans = [...answers];
    ans[index].val = newValue;
    updateQuestionsConditionHidden(questions, ans);
    setAnswers(ans);
    console.log(ans);
  }

  //currently, only ME(checkboxes need manually add validation, others' validations are handled automatically by formik)
  function generate_validation_line(
    question: Question,
    answer: QAnswer,
    type: any,
    required: boolean
  ) {
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
  }

  function generate_html_for_one_question(question: Question, answer: QAnswer) {
    const type = question.questionType;
    const qid = question.questionIndex;
    const required = question.required;
    if (type === QuestionTypeEnum.CATEGORY) {
      return (
        <>
          <Divider />
          <Typography component="h3" variant="h5">
            <PollOutlinedIcon fontSize="large" /> &nbsp; {question.questionText}
          </Typography>
          <Divider style={{ width: '100%' }} />
          <br />
        </>
      );
    } else if (type === QuestionTypeEnum.MULTIPLE_CHOICE) {
      if (question.shouldHidden === false && answer) {
        return (
          <>
            <Grid item md={12} sm={12}>
              <FormLabel>
                <Typography variant="h6">
                  <span>&#9679;&nbsp;</span>
                  {`${question.questionText}`}
                  {required ? ' *' : ''}
                </Typography>
              </FormLabel>

              <RadioGroup
                value={answer.val ? answer.val[0] : ''}
                defaultValue={answer.val ? answer.val[0] : ''}
                onChange={function (event, value) {
                  const arr = [];
                  if (value) {
                    arr.push(value);
                  }
                  updateAnswersByValue(qid, arr);
                }}>
                {console.log(question)}
                {question.mcOptions.map((McOption, index) => (
                  <FormControlLabel
                    key={index}
                    value={McOption.opt}
                    control={<Radio color="primary" required={required} />}
                    label={McOption.opt}
                  />
                ))}
              </RadioGroup>
            </Grid>
          </>
        );
      } else {
        return <></>;
      }
    } else if (type === QuestionTypeEnum.MULTIPLE_SELECT) {
      if (question.shouldHidden === false && answer) {
        return (
          <>
            <Grid item md={12} sm={12}>
              <FormLabel>
                <Typography variant="h6">
                  <span>&#9679;&nbsp;</span>
                  {`${question.questionText}`}
                  {required ? ' *' : ''}
                  {generate_validation_line(question, answer, type, required)}
                </Typography>
              </FormLabel>
              {question.mcOptions!.map((McOption, index) => (
                <>
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
                  />
                  <br />
                </>
              ))}
            </Grid>
          </>
        );
      } else {
        return <></>;
      }
    } else if (type === QuestionTypeEnum.INTEGER) {
      if (question.shouldHidden === false && answer) {
        return (
          <>
            <Grid item sm={12} md={12}>
              <FormLabel>
                <Typography variant="h6">
                  <span>&#9679;&nbsp;</span>
                  {`${question.questionText}`}
                  {required ? ' *' : ''}
                </Typography>
              </FormLabel>

              <Field
                component={TextField}
                defaultValue={answer.val ?? ''}
                variant="outlined"
                type="number"
                fullWidth
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
          </>
        );
      } else {
        return <></>;
      }
    } else if (type === QuestionTypeEnum.STRING) {
      if (question.shouldHidden === false && answer) {
        return (
          <>
            <Grid item sm={12} md={12}>
              <FormLabel>
                <Typography variant="h6">
                  <span>&#9679;&nbsp;</span>
                  {`${question.questionText}`}
                  {required ? ' *' : ''}
                </Typography>
              </FormLabel>

              <Field
                component={TextField}
                defaultValue={answer.val ?? ''}
                required={required}
                variant="outlined"
                fullWidth
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
          </>
        );
      } else {
        return <></>;
      }
    } else if (type === QuestionTypeEnum.DATE) {
      if (question.shouldHidden === false && answer) {
        return (
          <>
            <Grid item md={12} sm={12}>
              <FormLabel>
                <Typography variant="h6">
                  <span>&#9679;&nbsp;</span>
                  {`${question.questionText}`}
                  {required ? ' *' : ''}
                </Typography>
              </FormLabel>

              <Field
                component={TextField}
                defaultValue={answer.val ? getPrettyDateTime(answer.val) : null}
                fullWidth
                required={required}
                variant="outlined"
                type="date"
                label="Date"
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
          </>
        );
      } else {
        return <></>;
      }
    } else {
      console.log('INVALID QUESTION TYPE!!');
      return <></>;
    }
  }

  function generate_html_of_all_questions(qs: Question[], ans: QAnswer[]) {
    let i;
    const html_arr = [];
    for (i = 0; i < qs.length; i++) {
      const question = qs[i];
      const answer = ans[i];
      html_arr.push(generate_html_for_one_question(question, answer));
    }
    return html_arr;
  }

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={handleSubmit(
          patientId,
          answers,
          setSubmitError,
          setMultiSelectValidationFailed,
          isEditForm,
          fm
        )}>
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={2}>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>
                    {/* /////////////////////////////////////////////////////////////////////////////////////   */}
                    {generate_html_of_all_questions(questions, answers)}
                    {/* ////////////////////////////////////////////////////////////////////////////////////   */}
                  </Grid>
                </Box>
              </Box>
            </Paper>
            <br />
            <Button
              className={classes.right}
              color="primary"
              variant="contained"
              size="large"
              type="submit"
              disabled={isSubmitting}>
              {formTitle}
            </Button>
          </Form>
        )}
      </Formik>
      {(multiSelectValidationFailed = false)}
    </>
  );
};

const useStyles = makeStyles({
  right: {
    float: 'right',
  },
});

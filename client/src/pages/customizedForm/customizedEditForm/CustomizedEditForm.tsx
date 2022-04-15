import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { Field, Form, Formik } from 'formik';
import FormLabel from '@material-ui/core/FormLabel';
import React, { useState, useEffect } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { handleSubmit } from './handlers';
import { initialState, validationSchema } from './state';
import { Question } from 'src/shared/types';
import {
  getTimestampFromStringDate,
  getPrettyDateTime,
} from 'src/shared/utils';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { QAnswer } from 'src/shared/types';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from "@material-ui/core/Typography";

interface IProps {
  patientId: string;
  questions: Question[];
  isEditForm: boolean;
}

export const CustomizedEditForm = ({
  patientId,
  questions,
  isEditForm,
}: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  let isSubmitButtonClick = false;
  const [answers, _setAnswers] = useState<QAnswer[]>([
    { qidx: null, key: null, value: null },
  ]);
  const formTitle = isEditForm ? 'Update Form' : 'Submit Form';
  const setAnswers = (answers: any) => {
    _setAnswers(answers);
    updateQuestionsConditionHidden(questions, answers);
  };

  const setIsSubmitButtonClick = (submitButtonClick: boolean) => {
    isSubmitButtonClick = submitButtonClick;
  };

  useEffect(() => {
    let i;
    const anss: QAnswer[] = [];
    for (i = 0; i < questions.length; i++) {
      const question = questions[i];
      const ans: QAnswer = {
        qidx: question.questionIndex,
        key: null,
        value: null,
      };
      if (question.questionType === 'MC' || question.questionType === 'ME') {
        ans.key = 'mc';
        ans.value = question.answers?.mc ?? [];
      } else if (
        question.questionType === 'NUM' ||
        question.questionType === 'DATE'
      ) {
        ans.key = 'value';
        ans.value = question.answers?.value ?? null;
      } else if (question.questionType === 'TEXT') {
        ans.value = question.answers?.text ?? null;
        ans.key = 'text';
      } else {
        console.log('NOTE: INVALID QUESTION TYPE!!');
      }
      anss[i] = ans;
    }

    console.log(answers);

    //condition update must be 'after' the initilization of the 'answers'
    updateQuestionsConditionHidden(questions, anss);

    setAnswers(anss);
    console.log('NOTE: xxxxxx');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateQuestionsConditionHidden(
    questions: Question[],
    answers: QAnswer[]
  ) {
    let i;
    for (i = 0; i < questions.length; i++) {
      const question = questions[i];
      question.shouldHidden = false;

      if (question.visibleCondition?.length) {
        question.shouldHidden = true;
        let j;
        for (j = 0; j < question.visibleCondition.length; j++) {
          const condition = question.visibleCondition[j];
          const parentQidx = condition.qidx;
          const parentAnswer = answers[parentQidx];
          if (parentAnswer.value !== undefined && parentAnswer.value !== null) {
            if (
              questions[parentQidx].questionType === 'ME' ||
              questions[parentQidx].questionType === 'MC'
            ) {
              if (
                parentAnswer.value?.length > 0 &&
                condition.answer.mc?.length > 0 &&
                parentAnswer.value?.length === condition.answer.mc?.length
              ) {
                //only this type will have an array value in its 'Answer'
                //to see if those two array contains the same items
                let all_equal = true;
                condition.answer.mc.forEach((item, index) => {
                  //those two array are not equal
                  if (parentAnswer.value.indexOf(item) < 0) {
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
                questions[parentQidx].questionType === 'TEXT' &&
                //!!NOTE: THIS MAY HAVE BUGS!![USE == OR === ???]
                parentAnswer.value === condition.answer.text
              ) {
                question.shouldHidden = false;
              } else if (
                (questions[parentQidx].questionType === 'NUM' ||
                  questions[parentQidx].questionType === 'DATE') &&
                Number(parentAnswer.value) === Number(condition.answer.value)
              ) {
                console.log(parentAnswer.value);
                console.log(condition.answer.value);
                question.shouldHidden = false;
              } else {
                question.shouldHidden = true;
                break;
              }
            }
          }
        }
        //after decide the 'shouldHidden' field, we need to remove the answer from those hidden question, when it appears again, the field should be 'blank'
      }
    }
  }

  function updateAnswersByValue(index: number, newValue: any) {
    const ans = [...answers];
    ans[index].value = newValue;
    setAnswers(ans);
    console.log(ans);
  }

  //currently, only ME(checkboxes need manually add validation, others' validations are handled automatically by formik)
  function generate_validation_line(question: Question, answer: QAnswer, type:any, required:boolean){
    if(!(isSubmitButtonClick && required && answer.value)){
      return null;
    }
   if (type === 'ME') { 
      if(!answer.value!.length){
        return(<><Typography variant="overline" style={{color:"#FF0000", fontWeight: 600}}> (Must Select At Least One Option !)</Typography></>)}
        else{
          return null;
        }
    }else{
      console.log('INVALID QUESTION TYPE!!');
      return null;
    }
  }

  function generate_html_for_one_question(question: Question, answer: QAnswer) {
    const type = question.questionType;
    const qid = question.questionIndex;
    const required = question.required;
    if (type === 'MC') {
      if (question.shouldHidden === false && answer) {
        return (
          <>
            <Grid item md={12} sm={12}>
              <FormLabel>{`${qid + 1}. ${question.questionText}`}</FormLabel> 
              <br />
              <RadioGroup
                value={answer.value ? answer.value[0] : ''}
                defaultValue={answer.value ? answer.value[0] : ''}
                onChange={function (event, value) {
                  const arr = [];
                  if (value) {
                    arr.push(value);
                  }
                  updateAnswersByValue(qid, arr);
                }}>
                {question.mcOptions!.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    // control={<Radio color="primary"  />}
                    
                    control={<Radio color="primary" required={required} />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </Grid>
          </>
        );
      } else {
        return <></>;
      }
    } else if (type === 'ME') {
      if (question.shouldHidden === false && answer) {
        return (
          <>
            <Grid item md={12} sm={12}>
              <FormLabel>{`${qid + 1}. ${question.questionText}`}</FormLabel>
              {generate_validation_line(question, answer, type, required)}
              <br />
              {question.mcOptions!.map((option, index) => (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={option}
                        defaultChecked={answer.value?.indexOf(option) > -1}
                        onChange={(event, checked) => {
                          if (checked) {
                            const new_val = [
                              ...answer.value,
                              event.target.value,
                            ];
                            updateAnswersByValue(qid, new_val);
                          } else {
                            const original_val = [...answer.value];
                            const i = original_val.indexOf(event.target.value);
                            if (i > -1) {
                              original_val.splice(i, 1);
                            }
                            updateAnswersByValue(qid, original_val);
                          }
                        }}
                      />
                    }
                    label={option}
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
    } else if (type === 'NUM') {
      if (question.shouldHidden === false && answer) {
        return (
          <>
            <Grid item sm={12} md={12}>
              <FormLabel>{`${qid + 1}. ${question.questionText}`}</FormLabel>
              <br />
              <br />
              <Field
                component={TextField}
                defaultValue={answer.value ?? ''}
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
                }}
                onChange={(event: any) => {
                  updateAnswersByValue(qid, event.target.value);
                }}
              />
            </Grid>
          </>
        );
      } else {
        return <></>;
      }
    } else if (type === 'TEXT') {
      if (question.shouldHidden === false && answer) {
        return (
          <>
            <Grid item sm={12} md={12}>
              <FormLabel>{`${qid + 1}. ${question.questionText}`}</FormLabel>
              <br />
              <br />
              <Field
                component={TextField}
                defaultValue={answer.value ?? ''}
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
                  updateAnswersByValue(qid, event.target.value);
                }}
              />
            </Grid>
          </>
        );
      } else {
        return <></>;
      }
    } else if (type === 'DATE') {
      if (question.shouldHidden === false && answer) {
        return (
          <>
            <Grid item md={12} sm={12}>
              <FormLabel>{`${qid + 1}. ${question.questionText}`}</FormLabel>
              <br />
              <br />
              <Field
                component={TextField}
                defaultValue={
                  answer.value ? getPrettyDateTime(answer.value) : null
                }
                fullWidth
                required={required}
                variant="outlined"
                type="date"
                label="Date"
                // name={PatientField.dob}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(event: any) => {
                  //console.log(event.target.value);
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

  function generate_html_of_all_questions() {
    let i;
    const html_arr = [];
    for (i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answer = answers[i];
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
        onSubmit={handleSubmit(patientId, answers, setSubmitError,setIsSubmitButtonClick,setAnswers)}>
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={2}>
                <h2>Questionnaire</h2>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>
                    {/* /////////////////////////////////////////////////////////////////////////////////////   */}
                    {generate_html_of_all_questions()}
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
      {setIsSubmitButtonClick(false)}
    </>
  );
};

const useStyles = makeStyles({
  right: {
    float: 'right',
  },
});


// //backup
// function generate_validation_line(question: Question, answer: QAnswer, type:any, required:boolean){
//   if(!(isSubmitButtonClick && required && answer.value)){
//     return null;
//   }

//   if (type === 'MC'){
//     if(!answer.value![0]){
//       return(<><Typography variant="overline" style={{color:"#FF0000", fontWeight: 600}}> (Must Select One Option !)</Typography></>)}
//       else{
//         return null;
//       }
//   }else if (type === 'ME') { 
//     if(!answer.value!.length){
//       return(<><Typography variant="overline" style={{color:"#FF0000", fontWeight: 600}}> (Must Select At Least One Option !)</Typography></>)}
//       else{
//         return null;
//       }
//   }else if (type === 'NUM') {
//     console.log(answer);
//     if(!answer.value){
//       return(<><Typography variant="overline" style={{color:"#FF0000", fontWeight: 600}}> (Fill In A Value !)</Typography></>)}
//       else{
//         return null;
//       }
//   }else if (type === 'TEXT') {
//     if(!answer.value || !answer.value.length){
//       return(<><Typography variant="overline" style={{color:"#FF0000", fontWeight: 600}}> (Fill In Content !)</Typography></>)}
//       else{
//         return null;
//       }
//   }else if (type === 'DATE') {
//     if(!answer.value){
//       return(<><Typography variant="overline" style={{color:"#FF0000", fontWeight: 600}}> (Select A Date !)</Typography></>)}
//       else{
//         return null;
//       }
//   }else{
//     console.log('INVALID QUESTION TYPE!!');
//     return null;
//   }
// }
import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField'; 
import { Field, Form, Formik } from 'formik'; 
import FormLabel from '@material-ui/core/FormLabel' 
import React, { useState, useEffect, useRef } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast'; 
import { handleSubmit } from './handlers'; 
import { initialState, validationSchema } from './state'; 
import { Question } from 'src/shared/types'
import { getTimestampFromStringDate } from 'src/shared/utils' 
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { QAnswer } from 'src/shared/types';
// import { boolean } from 'yup';
import InputAdornment from '@material-ui/core/InputAdornment';

interface IProps {
  patientId: string;
  questions: Question[];
} 

export const CustomizedForm = ({ patientId, questions }: IProps) => {
  const classes = useStyles(); 
  const [submitError, setSubmitError] = useState(false); 
  const [answers, _setAnswers] = useState<(QAnswer)[]>([{ qidx: null, key: null, value: null }]); 
  //https://gustavostraube.wordpress.com/2019/05/29/custom-setters-with-react-usestate-hook/ 
  //自定义setter
  const setAnswers = (answers: any) => {
    // Some side-effect here ... 
    _setAnswers(answers);
    // ... or there
    console.log("尽量在这里更新questions中的每个question model的hidden字段");
    //接下来在这里你可以写一下你的questions的每个question的hidden值的判断。注意：
    //hidden字段服务器端不会有，是你自己在本地搞出来的。根据那个condition来判断。
    //update(questions)    
  };

  const initialDone = useRef<boolean>(false);
  //引用字段是空的，这个useEffect只会走一次【错误】
  useEffect(() => {
    if (initialDone.current === false) {
      let i;
      let anss: QAnswer[] = [];
      for (i = 0; i < questions.length; i++) {
        //初始化只会调用一次，此时应该questions的hidden都设置为false（一开始是一个空白表格)
        const question = questions[i];
        questions[i].shouldHidden = false;
        let ans: QAnswer = { qidx: question.questionIndex, key: null, value: null };
        if (question.questionType === 'MC' || question.questionType === 'ME') {
          ans.key = 'mc';
          if (question.questionType === 'ME') {
            //undefined的数组在access的时候会抛出错误
            ans.value = [];
          }
        } else if (question.questionType === 'NUM' || question.questionType === 'DATE') {
          ans.key = 'value';
          if (question.questionText === 'DATE') { 
          }
        } else if (question.questionType === 'TEXT') {
          ans.key = 'text';
        } else {
          console.log('NOTE: INVALID QUESTION TYPE!!')
        }
        anss[i] = ans;
      }

      console.log(answers);
      //没有下边这行，是不会有选项显示的！！
      setAnswers(anss);
      console.log('NOTE: xxxxxx');
    } else {
      initialDone.current = true;
    }
  }, [initialDone]);



  function updateAnswersByValue(index: number, newValue: any) {
    var ans = [...answers];
    ans[index].value = newValue;
    setAnswers(ans);
    console.log(ans);
  }; 
  

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema} 
        onSubmit={handleSubmit(patientId, setSubmitError)}>
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={2}>
                <h2>Referral</h2>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>
                    {/* //////////////////////////////////////1.单选//////////////////////////////////////////////   */}
                    {Boolean(answers[0]) && (
                      <>
                      <Grid item md={12} sm={12}> 
                        <FormLabel>Do you like playing pingpong?</FormLabel>
                        <br />
                        <RadioGroup
                          value={answers[0]!.value}
                          onChange={function (event, value) {
                            updateAnswersByValue(0, value);
                          }}>
                          <FormControlLabel
                            //key={0}
                            value={questions[0].mcOptions![0]}
                            control={
                              <Radio color="primary" required={true}
                              />
                            }
                            label={questions[0].mcOptions![0]}
                          />
                          <FormControlLabel
                            //key={1}
                            value={questions[0].mcOptions![1]}
                            control={
                              <Radio color="primary" required={true}
                              />
                            }
                            label={questions[0].mcOptions![1]}
                          />
                        </RadioGroup>
                      </Grid>
                      </>
                    )}

                    {/* //////////////////////////////////////2.多选//////////////////////////////////////////////   */}
                    {/* && Boolean(answers[1].value)  */}
                    {Boolean(answers[1]) && (
                      <>
                        <Grid item md={12} sm={12}>
                          <FormLabel>{questions[1].questionText}</FormLabel>
                          <br />
                          {questions[1].mcOptions!.map((option, index) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  value={option}
                                  //checked={answers[1].value?.includes(option)}
                                  // checked={true}
                                  onChange={(event, checked) => {
                                    if (checked) {
                                      //添加元素
                                      var new_val = [...answers[1].value, event.target.value];
                                      updateAnswersByValue(1, new_val);
                                    } else {
                                      //移除元素
                                      var original_val = [...answers[1].value];
                                      const i = original_val.indexOf(event.target.value);
                                      if (i > -1) {
                                        original_val.splice(i, 1);
                                      }
                                      updateAnswersByValue(1, original_val);
                                    }
                                  }}
                                />
                              }
                              label={option}
                              key={index}
                            />
                          ))}
                        </Grid>
                      </>
                    )}

                    {/* //////////////////////////////////////3.数字输入//////////////////////////////////////////////   */}
                      {Boolean(answers[2]) && (
                        <>
                         <Grid item sm={12} md={12}> 
                          <FormLabel>{questions[2].questionText}</FormLabel>
                          <br />
                          <br />
                          <Field
                            component={TextField}
                            variant="outlined"
                            type="number"
                            fullWidth
                            required
                            // label={'Diastolic'}
                            // name={ReadingField.bpDiastolic}
                            InputProps={{
                              endAdornment: Boolean(questions[2].units) && Boolean(questions[2].units!.trim().length > 0) && (
                                <InputAdornment position="end">{questions[2].units}</InputAdornment>
                              ),
                            }}
                            onChange={(event: any) => {
                              // console.log(event.target.value); 
                              updateAnswersByValue(2, event.target.value);
                            }} 
                          />
                          </Grid>
                        </>
                      )} 

                    {/* //////////////////////////////////////4.文字输入//////////////////////////////////////////////   */}
                      {Boolean(answers[4]) && (
                        <>
                        <Grid item sm={12} md={12}>
                          <FormLabel>{questions[4].questionText}</FormLabel>
                          <br />
                          <br />
                          <Field
                            component={TextField}
                            variant="outlined"
                            fullWidth
                            multiline
                            inputProps={{ maxLength: questions[4].stringMaxLength! > 0 ? questions[4].stringMaxLength : Number.MAX_SAFE_INTEGER }}
                            // name={AssessmentField.drugHistory}
                            //label={questions[4].stringMaxLength!>0? `Max Length ${questions[4].stringMaxLength}`:''}
                            onChange={(event: any) => {
                              updateAnswersByValue(4, event.target.value);
                            }}
                          />
                          </Grid>
                        </> 
                      )} 

                    {/* //////////////////////////////////////5.日期输入//////////////////////////////////////////////   */}
                      {Boolean(answers[5]) && (
                        <>
                          <Grid item md={12} sm={12}> 
                            <FormLabel>{questions[5].questionText}</FormLabel>
                            <br />
                            <br />
                            <Field
                              component={TextField}
                              fullWidth
                              required
                              variant="outlined"
                              type="date"
                              label="Date"
                              // name={PatientField.dob}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              onChange={(event: any) => {
                                //console.log(event.target.value);
                                const timestamp = getTimestampFromStringDate(event.target.value);
                                updateAnswersByValue(5, timestamp);
                              }

                              }
                            />
                          </Grid>
                        </>
                      )}
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
              Submit Referral
            </Button>
          </Form>
        )}
      </Formik>
    </>

  );
};

const useStyles = makeStyles({
  right: {
    float: 'right',
  },
});

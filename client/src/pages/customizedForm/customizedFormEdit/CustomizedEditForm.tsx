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
import { handleSubmit,handleSubmit2 } from './handlers'; 
import { initialState, validationSchema } from './state'; 
import { Question } from 'src/shared/types'
import { getTimestampFromStringDate,getStringDateFromTimestamp } from 'src/shared/utils' 
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { QAnswer } from 'src/shared/types';
// import { boolean } from 'yup';
import InputAdornment from '@material-ui/core/InputAdornment';
// import { values } from 'lodash';

interface IProps {
  patientId: string;
  questions: Question[];
} 

export const CustomizedEditForm = ({ patientId, questions }: IProps) => {
  const classes = useStyles(); 
  const [submitError, setSubmitError] = useState(false); 
  const [answers, _setAnswers] = useState<(QAnswer)[]>([{ qidx: null, key: null, value: null }]); 
  //https://gustavostraube.wordpress.com/2019/05/29/custom-setters-with-react-usestate-hook/ 
  //自定义setter
  const setAnswers = (answers: any) => {
    // Some side-effect here ... 
    _setAnswers(answers);
    // ... or there
    // console.log("尽量在这里更新questions中的每个question model的hidden字段");
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
          ans.value = (question.answers?.mc)??[];
          if (question.questionType === 'ME') {
            //undefined的数组在access的时候会抛出错误
            //ans.value = [];
          }
        } else if (question.questionType === 'NUM' || question.questionType === 'DATE') {
          ans.key = 'value';
          ans.value = (question.answers?.value)??null;
          if (question.questionText === 'DATE') { 
          }
        } else if (question.questionType === 'TEXT') {
          ans.value = (question.answers?.text)??null;
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



  function generate_html_for_one_question(question:Question, answer:QAnswer){
    const type = question.questionType;
    const qid = question.questionIndex;
    const required = question.required;

    //////////////////////////////////////1.单选//////////////////////////////////////////////
    if (type === 'MC'){
      if(answer){
        return( 
          <>
            <Grid item md={12} sm={12}> 
             <FormLabel>{`${qid + 1}. ${question.questionText}`}</FormLabel>
              <br />
              <RadioGroup       
                value={answer.value?answer.value[0]:''}
                defaultValue={answer.value?answer.value[0]:''}
                onChange={function (event, value) {
                  let arr = [];
                  if(value){
                    arr.push(value);
                  }
                  updateAnswersByValue(qid, arr);
                }}> 
              
          {question.mcOptions!.map((option, index) => (
            <FormControlLabel
                  //key={0}
                  value={option}
                  // defaultChecked={answer.value?.indexOf(option)>-1}
                  
                  control={
                    <Radio color="primary" required={required}  
                    />
                  }
                  label={option} 
                />))
          } 
              </RadioGroup>
            </Grid>
            </>
          ) 
      }else{
        return(
          <>
          </>
        )
      }
      
    }
    //////////////////////////////////////2.多选(提交时判断required)//////////////////////////////////////////////
    else if (type === 'ME'){
      if(answer){
        return(
          <>
            <Grid item md={12} sm={12}>
            <FormLabel>{`${qid + 1}. ${question.questionText}`}</FormLabel>
              <br />
              {question.mcOptions!.map((option, index) => (
                <>
                <FormControlLabel
                  
                  control={
                    
                    <Checkbox 
                      // required={required}
                      value={option}
                      defaultChecked={answer.value?.indexOf(option)>-1}
                      //checked={answers[1].value?.includes(option)}
                      // checked={true}
                      onChange={(event, checked) => {
                        if (checked) {
                          //添加元素
                          var new_val = [...answer.value, event.target.value];
                          updateAnswersByValue(qid, new_val);
                        } else {
                          //移除元素
                          var original_val = [...answer.value];
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
                <br/>
                </>
              ))}
            </Grid>
          </>
        )
      }else{
        return(
          <>
          </>
        )
      }
    }
    //////////////////////////////////////3.数字输入//////////////////////////////////////////////
    else if (type === 'NUM'){
      if(answer){
        return(   
          <>
           <Grid item sm={12} md={12}> 
           <FormLabel>{`${qid + 1}. ${question.questionText}`}</FormLabel>
            <br />
            <br />
            <Field
              component={TextField}
              defaultValue={answer.value??''}
              variant="outlined"
              type="number"
              fullWidth
              required={required}
              // label={'Diastolic'}
              // name={ReadingField.bpDiastolic}
              InputProps={{
                endAdornment: Boolean(question.units) && Boolean(question.units!.trim().length > 0) && (
                  <InputAdornment position="end">{question.units}</InputAdornment>
                ),
              }}
              onChange={(event: any) => {
                // console.log(event.target.value); 
                updateAnswersByValue(qid, event.target.value);
              }} 
            />
            </Grid>
          </>
        )
      }else{
        return(
          <>
          </>
        )
      } 
    }
    //////////////////////////////////////4.文字输入//////////////////////////////////////////////
    else if (type === 'TEXT'){
      if(answer){
        return(
          <>
          <Grid item sm={12} md={12}>
          <FormLabel>{`${qid + 1}. ${question.questionText}`}</FormLabel>
            <br />
            <br />
            <Field 
              component={TextField}
              defaultValue={answer.value??''}
              required={required}
              variant="outlined"
              fullWidth
              multiline
              inputProps={{ maxLength: question.stringMaxLength! > 0 ? question.stringMaxLength : Number.MAX_SAFE_INTEGER }}
              // name={AssessmentField.drugHistory}
              //label={question.stringMaxLength!>0? `Max Length ${question.stringMaxLength}`:''}
              onChange={(event: any) => {
                updateAnswersByValue(qid, event.target.value);
              }}
            />
            </Grid>
          </> 
        )

      }else{
        return(
          <>
          </>
        )
      }  
    }
    //////////////////////////////////////5.日期输入//////////////////////////////////////////////
    else if (type === 'DATE'){
      if(answer){
        return(
          <>
            <Grid item md={12} sm={12}> 
            <FormLabel>{`${qid + 1}. ${question.questionText}`}</FormLabel>
              <br />
              <br />
              <Field
                component={TextField}
                defaultValue={Boolean(answer.value)?getStringDateFromTimestamp(answer.value):null}
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
                  const timestamp = getTimestampFromStringDate(event.target.value);
                  updateAnswersByValue(qid, timestamp);
                }
  
                }
              />
            </Grid>
          </>
        ) 
      }else{
        return(
          <>
          </>
        )
      }  
    }
    //////////////////////////////////////!不合法//////////////////////////////////////////////
    else{
      console.log("INVALID QUESTION TYPE!!");
      return(
        <>
        </>
      )
    }
    // setCards(cards_elements);
  };

  function generate_html_of_all_questions(){
    let i;
    let html_arr = [];
    for(i = 0; i<questions.length; i++){
      let question = questions[i];
      let answer = answers[i];
      html_arr.push(generate_html_for_one_question(question, answer));
    }
    return html_arr;
  }
  

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        // initialValues={''}
        validationSchema={validationSchema} 
        onSubmit={handleSubmit(patientId, answers, setSubmitError)}>
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
              onClick={e=>{handleSubmit2(e,patientId, answers)}}
              disabled={isSubmitting}>
              
              Update Form
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

import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
// import TextField from '@material-ui/core/TextField';
// import { TextField as FormikTextField } from 'formik-material-ui';
// import { Field, Form, Formik } from 'formik';
import { Form, Formik } from 'formik';
import FormLabel from '@material-ui/core/FormLabel'
// import {
//   Autocomplete,
//   AutocompleteRenderInputParams,
// } from 'formik-material-ui-lab';
import React, { useState,useEffect } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
// import { useHealthFacilities } from 'src/shared/hooks/healthFacilities';
import { handleSubmit } from './handlers';
// import { initialState, ReferralField, validationSchema } from './state';
import { initialState, validationSchema } from './state';

import {Question} from 'src/shared/types'

// import RadioGroup from '@material-ui/core/RadioGroup';
// import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';
import {QAnswer} from 'src/shared/types';
import Checkbox from '@material-ui/core/Checkbox';


interface IProps {
  patientId: string;
  questions: Question[];
}
// export type QAnswer = {
//   qidx:number;
//   key:string;//value,text,mc,comment
//   value:any;
// }
export const CustomizedForm = ({ patientId,questions }: IProps) => {
  const classes = useStyles();
  // const healthFacilities = useHealthFacilities();
  const [submitError, setSubmitError] = useState(false);
  // const [answers, setAnswers] = userState<QAnswer[]>();
  // const [answer0, setAnswer0] = useState<QAnswer|any>({qidx:-1, answer:{value:-1, text:'', mc:[], comment:''}});
  const [answers, _setAnswers] = useState<(QAnswer)[]>([{qidx:null, key:null, value:undefined}]);
  // const [val, _setVal] = useState<any>();
  //https://gustavostraube.wordpress.com/2019/05/29/custom-setters-with-react-usestate-hook/ 
  //自定义setter
  const setAnswers = (answers:any) => {
    // Some side-effect here ... 
    _setAnswers(answers);
    // ... or there
    console.log("尽量在这里更新questions中的每个question model的hidden字段");
    //接下来在这里你可以写一下你的questions的每个question的hidden值的判断。注意：
    //hidden字段服务器端不会有，是你自己在本地搞出来的。根据那个condition来判断。
    //update(questions)    

};
  

//引用字段是空的，这个useEffect只会走一次
useEffect(() => {
  let i;
  let anss: QAnswer[] = [];
  for(i=0; i<questions.length;i++){
    //初始化只会调用一次，此时应该questions的hidden都设置为false（一开始是一个空白表格)
    const question = questions[i];
    questions[i].shouldHidden = false;
      let ans :QAnswer = {qidx:question.questionIndex, key:null, value:undefined}; 
      if(question.questionType === 'MC' || question.questionType === 'ME'){
        ans.key = 'mc';
        if(question.questionType==='ME'){
          //undefined的数组在access的时候会抛出错误
          ans.value=[];
        }
      }else if(question.questionType === 'NUM' || question.questionType === 'DATE'){
        ans.key = 'value';
      }else if(question.questionType === 'TEXT'){
        ans.key = 'text';
      }else{
        console.log('NOTE: INVALID QUESTION TYPE!!')
      }
      anss[i] = ans;
      answers[i] = ans;
  }
           
  console.log(answers);
  //没有下边这行，是不会有选项显示的！！
  setAnswers(anss);
  console.log('NOTE: xxxxxx');
},[] );
 

  
function updateAnswersByValue(index:number, newValue:any){
  var ans = answers; 
  ans[index].value = newValue;
  setAnswers(ans);
  console.log(ans);
}; 
  // console.log(answers[1]);
  // console.log(questions[1]);

  // const handleRadioButtonClick = (
  //   // event: React.MouseEvent<HTMLButtonElement, MouseEvent>, 
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   index:number,
  //   original_val:any
  //   // setValue: React.Dispatch<React.SetStateAction<any>>
  // ) => {
  //   // const element = event.currentTarget as HTMLInputElement;
  //   // const element = event.target as HTMLInputElement;
  //   // const eventValue = element.value; 
  //   const eventValue = event.target.value;   

  //   if (eventValue === original_val) {
  //     // updateAnswersByValue(index,undefined);
  //   } else {
  //     // updateAnswersByValue(index,eventValue);
  //   }
  //   updateAnswersByValue(index,eventValue);
  // };

  

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}    
        //initialValues={initialState}
        // validationSchema={}
        onSubmit={handleSubmit(patientId, setSubmitError)}>
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={2}>
                <h2>Referral</h2>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>

                  {/* ////////////////////////////////////////////////////////////////////////////////////   */}
                  {Boolean(answers[1]) &&Boolean(answers[1].value)  &&  (<Grid item> 
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
                                  updateAnswersByValue(1,new_val); 
                                } else {
                                  //移除元素
                                  var original_val = [...answers[1].value];
                                  const i = original_val.indexOf(event.target.value); 
                                  if(i>-1){
                                    original_val.splice(i, 1);
                                  }
                                  updateAnswersByValue(1,original_val);
                              }
                              }}
                            /> 
                          }
                          label={ option }
                          key={index}
                        />
                      ))}
                    </Grid>
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

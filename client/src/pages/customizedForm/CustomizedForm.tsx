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

import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';
import {QAnswer} from 'src/shared/types';
// import { NotVoid } from 'lodash';
// import xtype from 'xtypejs'
// import { ViewArray } from '@material-ui/icons';

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
  const setAnswers = (answers:QAnswer[]) => {
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
  initializeAnswers();
  //console.log(answers);
  console.log('NOTE: xxxxxx');
}, );

function initializeAnswers(){
  let i;
  for(i=0; i<questions.length;i++){
    const question = questions[i];
      let ans :QAnswer = {qidx:question.questionIndex, key:null, value:undefined}; 
      if(question.questionType === 'MC' || question.questionType === 'ME'){
        ans.key = 'mc';
      }else if(question.questionType === 'NUM' || question.questionType === 'DATE'){
        ans.key = 'value';
      }else if(question.questionType === 'TEXT'){
        ans.key = 'text';
      }else{
        console.log('NOTE: INVALID QUESTION TYPE!!')
      }
      answers[i] = ans;
  }
};

  
function updateAnswersByValue(index:number, newValue:any){
  var ans = answers; 
  ans[index].value = newValue;
  console.log(ans);
  console.log(index);
  console.log(newValue);
  console.log(ans[0]!.value);
  setAnswers(ans);
  
};




  // const [answer0, setAnswer0] = useState();

  // const [questions, setQuestions] = useState();
  console.log(questions);

  const handleRadioButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>, 
    // event: React.ChangeEvent<HTMLInputElement>,
    index:number,
    //original_val:any
    // setValue: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const element = event.target as HTMLInputElement; 
    const eventValue = element.value;  
    console.log(eventValue);  

    if (eventValue === answers[index].value) {
      updateAnswersByValue(index, undefined);
    } else {
      updateAnswersByValue(index,eventValue);
    }
    // updateAnswersByValue(index,eventValue);
  };

  

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
                  <Grid item md={6} sm={6}>

                    {/* <b>Do you like playing pingpong?</b> */}
                    <FormLabel>Do you like playing pingpong?</FormLabel>
                    <br />  
                    <RadioGroup 
                      value={answers[0]!.value} 
                      defaultValue={undefined}   
                      onChange={function(event,value){ 
                        //updateAnswersByValue(0,value);

                      }}>
                      <FormControlLabel
                        key={0}
                        value={questions[0].mcOptions![0]}
                        control={
                          <Radio 
                          checked={Boolean('vary much' === answers[0]!.value)} 
                          onClick={(event)=>{handleRadioButtonClick(event,0)}}
                          />
                        }
                        label={questions[0].mcOptions![0]}  
                      />
                      <FormControlLabel
                        key={1}
                        value={questions[0].mcOptions![1]}
                        control={
                          <Radio 
                          checked={Boolean('a little' === answers[0]!.value)}
                          onClick={(event)=>{handleRadioButtonClick(event,0)}}
                          />
                        }
                        label={questions[0].mcOptions![1]}
                      />
                    </RadioGroup>
                  </Grid>

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

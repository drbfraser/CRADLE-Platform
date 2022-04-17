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
import { QAnswer, McOption ,CForm} from 'src/shared/types';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from "@material-ui/core/Typography";
import {QuestionTypeEnum,AnswerTypeEnum} from 'src/shared/enums';
import Divider from '@material-ui/core/Divider';
// import RecentActorsIcon from '@material-ui/icons/RecentActors';
import PollOutlinedIcon from '@material-ui/icons/PollOutlined';
// import Chip from '@material-ui/core/Chip';
// import { useStateWithCallbackLazy } from material-ui/icons/PollOutlined'use-state-with-callback';
interface IProps {
  patientId: string;
  fm: CForm;
  isEditForm: boolean;
}

export const CustomizedForm = ({
  patientId,             
  fm,
  isEditForm,
}: IProps) => {
  // console.log(fm.questions);
  
  // const [questions] = useState<Question[]>(fm.questions);  
 
  let questions = fm.questions;
  // setQuestions(fm.questions);
  // const questions = form.questions;
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // let isSubmitButtonClick = false;
  // setMultiSelectValidationFailed
  let [multiSelectValidationFailed] = useState(false);

  // let multiSelectValidationFailed = false;
  // const [answers, _setAnswers] = useState<QAnswer[]>([
  //   { qidx: -1, qtype: null, anstype:null, val: null },
  // ]);
  // const [answers, setAnswers] = useState<QAnswer[]>([]);
  const [answers, setAnswers] = useState <QAnswer[]>([]);
  const formTitle = isEditForm ? 'Update Form' : 'Submit Form';
  // const setAnswers = (ans: any) => {
  //   _setAnswers(ans);
  //   updateQuestionsConditionHidden(questions, ans);
  //   console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  //   console.log(ans);
  //   console.log(answers);

  // };

//   setAnswers(answers, () => {
    
//     // console.log(answers);
//  });

// useEffect(() => {
//   // console.log('klkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
//   // console.log(answers);
//   if(answers.length>0){updateQuestionsConditionHidden(questions, answers);}
//     console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa');
//     console.log(answers);
// }, [answers]);

 

 console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
 console.log(answers);
  const setMultiSelectValidationFailed = (ValidationFailed: boolean) => {
    multiSelectValidationFailed = ValidationFailed;
    if(answers.length>0){setAnswers(answers);}
  };            

  function getValuesFromIDs(question: Question, mcidArray:number[] | undefined){
    if(!mcidArray){
      return [];
    }
    let res = []
    let i = 0;
    let mcOptions = question.mcOptions ?? [];
    for(i=0; i < mcidArray.length; i++){
      //看看要不要用[...mcOptions[i]]
      res.push(mcOptions[i].opt);
    }
    return res;
  }
                 
  useEffect(() => {
    //setQuestions(fm.questions);
    let i;
    const anss: QAnswer[] = [];
    for (i = 0; i < questions.length; i++) {
      const question = questions[i];
      const ans: QAnswer = {
        qidx: question.questionIndex,
        qtype: null,
        anstype:null,
        val: null,
      };

    if (question.questionType === QuestionTypeEnum.MULTIPLE_CHOICE) {
      ans.qtype = QuestionTypeEnum.MULTIPLE_CHOICE;
      ans.anstype = AnswerTypeEnum.MCID_ARRAY;
      if(question.answers?.mcidArray && question.answers?.mcidArray.length>0){
        const ids = question.answers?.mcidArray.map((idx, opt) => {
           return idx;
        });
        ans.val = getValuesFromIDs(question, ids);
      }else{
        ans.val = [];
      }
      
    }else if (question.questionType === QuestionTypeEnum.MULTIPLE_SELECT) {
      ans.qtype = QuestionTypeEnum.MULTIPLE_SELECT;
      ans.anstype = AnswerTypeEnum.MCID_ARRAY;
      // ans.val = getValuesFromIDs(question, question.answers?.mcidArray);
      if(question.answers?.mcidArray && question.answers?.mcidArray.length>0){
        const ids = question.answers?.mcidArray.map((idx, opt) => {
           return idx;
        });
        ans.val = getValuesFromIDs(question, ids);
      }else{
        ans.val = [];
      }


    } else if ( question.questionType === QuestionTypeEnum.INTEGER ) {
      ans.qtype = QuestionTypeEnum.INTEGER;
      //THE FOLLOWING TWO FIELDS ARE RELATED
      ans.anstype = AnswerTypeEnum.NUM;
      ans.val = question.answers?.number ?? null;
    } else if ( question.questionType === QuestionTypeEnum.DATE  ) {
      ans.qtype = QuestionTypeEnum.DATE;
      ans.anstype = AnswerTypeEnum.NUM;
      ans.val = question.answers?.number ?? null;
    } else if (question.questionType === QuestionTypeEnum.STRING) {
      ans.qtype = QuestionTypeEnum.STRING;
      ans.anstype = AnswerTypeEnum.TEXT;
      ans.val = question.answers?.text ?? null; 
    }  else if (question.questionType === QuestionTypeEnum.CATEGORY) {
      ans.qtype = QuestionTypeEnum.CATEGORY;
      ans.anstype = AnswerTypeEnum.CATEGORY;
      ans.val = null; 
    }else {
      console.log(question.questionType);
      console.log('NOTE: INVALID QUESTION TYPE!!');
    }
    anss[i] = ans;
  }

    // console.log(answers);

    //condition update must be 'after' the initilization of the 'answers'
   
    updateQuestionsConditionHidden(questions, anss);
    setAnswers(anss);
     
    console.log(answers);
    console.log('NOTE: xxxxxx=========================');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

                

  function updateQuestionsConditionHidden(
    questions: Question[],
    answers: QAnswer[]
  ) {

    // if(!answers || !questions){return}
    let i;
    for (i = 0; i < questions.length; i++) {
      const question = questions[i];
      question.shouldHidden = false;       
                  
      if (question.visibleCondition?.length>0) {
        question.shouldHidden = true;
        let j;
        for (j = 0; j < question.visibleCondition?.length; j++) {
          const condition = question.visibleCondition[j];
          const parentQidx = condition.qidx;
          
          const parentAnswer = answers[parentQidx];
          const parentQOptions = questions[parentQidx].mcOptions??[];
          console.log(answers);
          console.log(question);
          console.log(parentQidx);
          console.log(parentAnswer);
          // if (parentAnswer.val !== undefined && parentAnswer.val !== null) {
            if (parentAnswer.val) {
            
            if (
              questions[parentQidx].questionType === QuestionTypeEnum.MULTIPLE_CHOICE ||
              questions[parentQidx].questionType === QuestionTypeEnum.MULTIPLE_SELECT
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
                  // console.log(parentAnswer.val);
                  // console.log(condition_expected_ans);
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
                questions[parentQidx].questionType === QuestionTypeEnum.STRING &&
                //!!NOTE: THIS MAY HAVE BUGS!![USE == OR === ???]
                parentAnswer.val === condition.answers.text
              ) {
                question.shouldHidden = false;
              } else if (
                (questions[parentQidx].questionType === QuestionTypeEnum.INTEGER ||
                  questions[parentQidx].questionType === QuestionTypeEnum.DATE) &&
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
        //after decide the 'shouldHidden' field, we need to remove the answer from those hidden question, when it appears again, the field should be 'blank'
      }

      if(question.questionType === QuestionTypeEnum.CATEGORY){
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
  function generate_validation_line(question: Question, answer: QAnswer, type:any, required:boolean){
    // if(!(multiSelectValidationFailed && required && answer.val && !questions[answer.qidx].shouldHidden)){
    //   return null;
    // }
    if(!multiSelectValidationFailed){
      return null;
    }                

   if (type === QuestionTypeEnum.MULTIPLE_SELECT && !question.shouldHidden) { 
      if(!answer.val!.length){
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
    console.log('00000000000000000000000000000000000000000000');
    console.log(answer);
    const type = question.questionType;
    const qid = question.questionIndex;
    const required = question.required;
    if (type === QuestionTypeEnum.CATEGORY) {
      return (<>
       <Divider />
      <Typography component="h3" variant="h5">
          <PollOutlinedIcon fontSize="large" /> &nbsp; {question.questionText}
        </Typography>
        {/* <Divider variant="middle" /> */}
        <Divider style={{width:'100%'}} />
        {/* <Chip label={question.questionText} /> */}
        {/* </Divider> */}
        <br />
      </>)
    }               
    else if (type === QuestionTypeEnum.MULTIPLE_CHOICE) {
      if (question.shouldHidden === false && answer) {
        // console.log('111111111111111111111111111111111111111111');
        // console.log(answer.val);
        // console.log('111111111111111111111111111111111111111111');
        return (
          <>
            <Grid item md={12} sm={12}>
              <FormLabel> 
              <Typography variant="h6">
                <span>&#9679;&nbsp;</span>
                 {`${question.questionText}`}
                </Typography>
                </FormLabel> 
               
              <RadioGroup
                value={answer.val ? answer.val[0]: ''}
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
                    // control={<Radio color="primary"  />}
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
                </Typography>
              </FormLabel>
              {generate_validation_line(question, answer, type, required)}
               
              {question.mcOptions!.map((McOption:McOption, index) => (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={McOption.opt}
                        defaultChecked={answer.val?.indexOf(McOption.opt) > -1}
                        onChange={(event, checked) => {
                          if (checked) {
                            const new_val = [
                              ...answer.val,
                              event.target.value,
                            ];
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
                   min: (question.numMin||question.numMin===0)?question.numMin:Number.MIN_SAFE_INTEGER, 
                  max: (question.numMax||question.numMax===0)?question.numMax:Number.MAX_SAFE_INTEGER },
                }
              }
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
                </Typography>
              </FormLabel>
                
              <Field
                component={TextField}
                defaultValue={
                  answer.val ? getPrettyDateTime(answer.val) : null
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

  function generate_html_of_all_questions(qs: Question[], ans: QAnswer[]) {
    let i;
    const html_arr = [];
    // console.log('klkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
    // console.log(ans);
    for (i = 0; i < qs.length; i++) {
      const question = qs[i];
      const answer = ans[i];
      html_arr.push(generate_html_for_one_question(question, answer));
    }
    return html_arr;
  }

  return (
    <>
    {console.log('9999999999999999')}
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={handleSubmit(patientId, answers, setSubmitError,setMultiSelectValidationFailed,setAnswers,isEditForm,fm)}>
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={2}>
                {/* <h2>Questionnaire</h2> */}
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
      {multiSelectValidationFailed=false}
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
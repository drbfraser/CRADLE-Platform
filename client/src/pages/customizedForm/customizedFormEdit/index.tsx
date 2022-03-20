import React from 'react';
// import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useRouteMatch } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { CustomizedEditForm } from './CustomizedEditForm';
import { goBackWithFallback } from 'src/shared/utils';
// import { SelectHeaderForm } from './customizedFormHeader/SelectHeaderForm';
import {Question} from 'src/shared/types'
import qs from "../customizedFormHeader/form.json";

type RouteParams = {
  patientId: string;
};

export const CustomizedEditFormPage = () => {
  const classes = useStyles();
  const { patientId } = useRouteMatch<RouteParams>().params;
  // const [questions, setQuestions]= useState<Question[]>(qs);
  const questions :Question[] = qs; 
  //setQuestions(qs);
  // questions = qs;

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => goBackWithFallback('/patients')}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">New Form for {patientId}</Typography>
      </div>

      <br />
      {/* <SelectHeaderForm patientId={patientId} setQuestions = {setQuestions} />
      {console.log(qs)} */}

      {questions!.length > 0 && (<><br /><CustomizedEditForm patientId={patientId} questions={questions}/></>)}
    </div>
  );
};

const useStyles = makeStyles({
  container: {
    maxWidth: 1250,
    margin: '0 auto',
  },
  title: {
    display: `flex`,
    alignItems: `center`,
  },
});

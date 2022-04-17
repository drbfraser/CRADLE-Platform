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
import { CForm,Question} from 'src/shared/types';
import form from '../customizedFormHeader/form_edit.json';

type RouteParams = {
  patientId: string;
  formId: string;
};

export const CustomizedEditFormPage = () => {
  const classes = useStyles();
  const { patientId, formId } = useRouteMatch<RouteParams>().params;
  console.log(form);
  const fm: CForm = form;
  const questions: Question[] = fm.questions;
  console.log(formId);
  

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => goBackWithFallback('/patients')}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">Eidt Form for {patientId}</Typography>
      </div>

      <br />

      {questions!.length > 0 && (
        <>
          <br />
          <CustomizedEditForm
            patientId={patientId} 
            form = {fm}
            isEditForm={true}
          />
        </>
      )}
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

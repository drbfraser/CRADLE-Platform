import React, {useEffect,useState} from 'react';
// import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useRouteMatch } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { CustomizedForm as CustomizedForm } from './CustomizedForm';
import { goBackWithFallback } from 'src/shared/utils';
import { CForm} from 'src/shared/types';
// import form from '../customizedFormHeader/form_edit.json';
import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';

type RouteParams = {
  patientId: string;
  formId: string;
};


 

export const CustomizedEditFormPage = () => {
  const classes = useStyles();
  const { patientId, formId } = useRouteMatch<RouteParams>().params;
  // console.log(form);
  // const fm: CForm = form;
  const [form, setForm] = useState<CForm>();  
  // const questions: Question[] = form.questions;
  // console.log(formId);


  useEffect(() => {
    const url = API_URL + EndpointEnum.FORM + '/'+`${formId}`;
    try {
      apiFetch(url)
      .then((resp) => resp.json())
      .then((fm:CForm) => {
        console.log(fm);
        console.log(fm.questions);
        setForm(fm);
      })
    }
    catch(e){
        console.error(e);
      }
    }, []);
  

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

      {form && form.questions && form!.questions!.length > 0 && (
        <>
          <br />
          <CustomizedForm
            patientId={patientId} 
            form = {form}
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

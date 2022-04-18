import React, { useState,useEffect } from 'react'; //useRef
import { makeStyles } from '@material-ui/core/styles';
import { useRouteMatch  } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { CustomizedForm } from './customizedEditForm/CustomizedForm';
import { goBackWithFallback } from 'src/shared/utils';
import { SelectHeaderForm } from './customizedFormHeader/SelectHeaderForm';
import {FormSchema,CForm } from 'src/shared/types';
import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';

type RouteParams = {
  patientId: string;
};


export const CustomizedFormPage = () => {
  const classes = useStyles();
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [form, _setForm] = useState<CForm>();      

  const [formSchemas,setFormSchemas] = useState<FormSchema[]>([]);
  const setForm = (form: CForm) => {
    _setForm(form);
  };


   
 
  useEffect(() => {
    /*eslint no-useless-concat: "error"*/
    apiFetch(API_URL + EndpointEnum.FORM_TEMPLATE)
      .then((resp) => resp.json())
      .then((form_schemas) => {
        setFormSchemas(form_schemas);
      })
      .catch(() => {
        console.log("Error Loading !!!!!!");
      });
    
  },[]);

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
      <SelectHeaderForm patientId={patientId} setForm={setForm} formSchemas={formSchemas}/>
      {form && form.questions && form!.questions!.length > 0 && (
        <>
          <br />
          <br />             
          <br />
          <br />
          <br />
          <CustomizedForm
            patientId={patientId}
            fm={form}
            isEditForm={false}
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

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
// import { useHistory } from 'react-router-dom';
import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';

type RouteParams = {
  patientId: string;
};

// interface LocationState {
//   pathname:string;
//   search:string;
// }           


export const CustomizedFormPage = () => {
  // const location = useLocation();
  // const {search} = useLocation<LocationState>();
  // console.log(search);
  // console.log(useLocation<LocationState>());
  const classes = useStyles();
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [form, _setForm] = useState<CForm>();      
  // const [questions, setQuestions] = useState<Question[]>([]);

  const [formSchemas,setFormSchemas] = useState<FormSchema[]>([]);

  // let formSchemas:FormSchema[];
  // const [errorLoading, setErrorLoading] = useState(false);
  // let formSchemas = useRef<FormSchema[]>([]);

  // let formSchemas: FormSchema[] = [];
  // let questions:Question[];
  const setForm = (form: CForm) => {
    _setForm(form);
    // questions = form.questions;
  };


   
 
  useEffect(() => {
    /*eslint no-useless-concat: "error"*/
    apiFetch(API_URL + EndpointEnum.FORM_TEMPLATE)
      .then((resp) => resp.json())
      .then((form_schemas) => {
        setFormSchemas(form_schemas);
        // console.log(formSchemas);
      })
      .catch(() => {
        // setErrorLoading(true);
        console.log("Error Loading !!!!!!");
      });
    // if(formSchemas){
    //   setFormSchemas([]);
    // }
    
  },[]);

  console.log(formSchemas);

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
            form={form!}
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

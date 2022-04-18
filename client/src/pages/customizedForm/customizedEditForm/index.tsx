import React, {useEffect,useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useRouteMatch } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { CustomizedForm as CustomizedForm } from './CustomizedForm';
import { goBackWithFallback } from 'src/shared/utils';
import { CForm} from 'src/shared/types';
import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';

type RouteParams = {
  patientId: string;
  formId: string;
};


 

export const CustomizedEditFormPage = () => {
  const classes = useStyles();
  const { patientId, formId } = useRouteMatch<RouteParams>().params;
  const [form, setForm] = useState<CForm>();  


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
            fm = {form}
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

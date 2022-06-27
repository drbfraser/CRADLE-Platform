import { API_URL, apiFetch } from 'src/shared/api';
import { CForm, FormSchema } from 'src/shared/types';
import React, { useEffect, useState } from 'react'; //useRef

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { CustomizedForm } from './customizedEditForm/CustomizedForm';
import { EndpointEnum } from 'src/shared/enums';
import IconButton from '@material-ui/core/IconButton';
import { SelectHeaderForm } from './customizedFormHeader/SelectHeaderForm';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { goBackWithFallback } from 'src/shared/utils';
import { makeStyles } from '@material-ui/core/styles';
import { useRouteMatch } from 'react-router-dom';

type RouteParams = {
  patientId: string;
};

export const CustomizedFormPage = () => {
  const classes = useStyles();
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [form, _setForm] = useState<CForm>();
  const [formSchemas, setFormSchemas] = useState<FormSchema[]>([]);

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
        console.log('Error Loading !!!!!!');
      });
  }, []);

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
      <SelectHeaderForm
        patientId={patientId}
        setForm={setForm}
        formSchemas={formSchemas}
      />
      {form && form.questions && form!.questions!.length > 0 && (
        <CustomizedForm patientId={patientId} fm={form} isEditForm={false} />
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

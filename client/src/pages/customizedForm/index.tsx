import { CForm, FormTemplate } from 'src/shared/types';
import React, { useEffect, useState } from 'react'; //useRef

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { CustomizedForm } from './customizedEditForm/CustomizedForm';
import IconButton from '@material-ui/core/IconButton';
import { SelectHeaderForm } from './customizedFormHeader/SelectHeaderForm';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { getFormTemplatesAsync } from 'src/shared/api';
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
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);

  const setForm = (form: CForm) => {
    _setForm(form);
  };

  const updateFormTemplates = async () =>
    setFormTemplates(await getFormTemplatesAsync());

  useEffect(() => {
    try {
      updateFormTemplates();
    } catch (e) {
      console.log(e);
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
        <Typography variant="h4">New Form for {patientId}</Typography>
      </div>

      <br />
      <SelectHeaderForm
        patientId={patientId}
        setForm={setForm}
        formSchemas={formTemplates}
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

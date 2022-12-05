import { useEffect, useState } from 'react';

import { CForm } from 'src/shared/types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { CustomizedViewForm } from './customizedViewForm';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { getFormResponseAsync } from 'src/shared/api';
import { goBackWithFallback } from 'src/shared/utils';
import makeStyles from '@mui/styles/makeStyles';
import { useRouteMatch } from 'react-router-dom';

type RouteParams = {
  patientId: string;
  formId: string;
};

export const CustomizedViewFormPage = () => {
  const classes = useStyles();
  const { patientId, formId } = useRouteMatch<RouteParams>().params;
  const [form, setForm] = useState<CForm>();

  useEffect(() => {
    const getFormResponse = async () => {
      try {
        setForm(await getFormResponseAsync(formId));
      } catch (e) {
        console.error(e);
      }
    };
    getFormResponse();
  }, [formId]);

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback('/patients')}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">View Form for {patientId}</Typography>
      </div>
      {form && form.questions && form!.questions!.length > 0 && (
        <CustomizedViewForm patientId={patientId} fm={form} />
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
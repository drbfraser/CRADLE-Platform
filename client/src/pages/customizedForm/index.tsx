import { CForm } from 'src/shared/types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { CustomizedForm } from './customizedEditForm/CustomizedForm';
import IconButton from '@mui/material/IconButton';
import { SelectHeaderForm } from './customizedFormHeader/SelectHeaderForm';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { goBackWithFallback } from 'src/shared/utils';
import makeStyles from '@mui/styles/makeStyles';
import { useRouteMatch } from 'react-router-dom';
import { useState } from 'react';
import { FormRenderStateEnum } from 'src/shared/enums';

type RouteParams = {
  patientId: string;
};

export const CustomizedFormPage = () => {
  const classes = useStyles();
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [form, setForm] = useState<CForm>();

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
        <Typography variant="h4">New Form for {patientId}</Typography>
      </div>

      <SelectHeaderForm setForm={setForm} />
      {form && form.questions && form!.questions!.length > 0 && (
        <CustomizedForm
          patientId={patientId}
          fm={form}
          renderState={FormRenderStateEnum.FIRST_SUBMIT}
        />
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

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { PatientForm } from './PatientForm';
import { useRouteMatch } from 'react-router-dom';
import { getPatientState, PatientState } from './state';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { goBackWithFallback } from '../../shared/utils';

type RouteParams = {
  patientId: string | undefined;
};

export const PatientFormPage = () => {
  const classes = useStyles();
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [formInitialState, setFormInitialState] = useState<PatientState>();

  useEffect(() => {
    getPatientState(patientId).then((state) => setFormInitialState(state));
  }, [patientId]);

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback(`/patients/${patientId ?? ''}`)}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">
          {patientId !== undefined ? 'Edit Patient' : 'New Patient'}
        </Typography>
      </div>
      <br />
      {formInitialState === undefined ? (
        <LinearProgress />
      ) : (
        <PatientForm
          initialState={formInitialState}
          creatingNew={patientId === undefined}
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

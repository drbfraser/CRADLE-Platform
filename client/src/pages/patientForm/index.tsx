import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { PatientForm } from './PatientForm';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { getPatientState, PatientState } from './state';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';

type RouteParams = {
  patientId: string | undefined;
};

export const PatientFormPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [formInitialState, setFormInitialState] = useState<PatientState>();

  useEffect(() => {
    getPatientState(patientId).then((state) => setFormInitialState(state));
  }, [patientId]);

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={history.goBack}>
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

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { PatientForm } from './PatientForm';
import { useRouteMatch } from 'react-router-dom';
import { getPatientState, PatientState } from './state';
import LinearProgress from '@material-ui/core/LinearProgress';

type RouteParams = {
  patientId: string | undefined;
  editId: string;
};

export const PatientFormPage = () => {
  const classes = useStyles();
  const { patientId, editId } = useRouteMatch<RouteParams>().params;
  const [formInitialState, setFormInitialState] = useState<PatientState>();

  useEffect(() => {
    getPatientState(patientId).then((state) => setFormInitialState(state));
  }, [patientId]);

  return (
    <div className={classes.container}>
      {formInitialState === undefined ? (
        <LinearProgress />
      ) : (
        <PatientForm
          initialState={formInitialState}
          patientId={patientId}
          creatingNew={patientId === undefined}
          editId={editId}
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
});

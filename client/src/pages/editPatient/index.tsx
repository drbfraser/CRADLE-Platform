import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { PatientForm } from './PatientForm';
import { RouteComponentProps } from 'react-router-dom';
import { getPatientState, PatientState } from './state';
import LinearProgress from '@material-ui/core/LinearProgress';

type Params = {
  editId: string | undefined;
};

export const EditPatientPage: React.FC<RouteComponentProps<Params>> = ({
  match: {
    params: { editId },
  },
}) => {
  const classes = useStyles();
  const [formInitialState, setFormInitialState] = useState<PatientState>();

  useEffect(() => {
    getPatientState(editId).then((state) => setFormInitialState(state));
  }, [editId]);

  return (
    <>
      <div className={classes.container}>
        <h1>
          {editId !== undefined ? 'Edit Patient ' + editId : 'New Patient'}
        </h1>
        {formInitialState === undefined ? (
          <LinearProgress />
        ) : (
          <PatientForm
            initialState={formInitialState}
            creatingNew={editId === undefined}
          />
        )}
      </div>
    </>
  );
};

const useStyles = makeStyles({
  container: {
    maxWidth: 1250,
    margin: '0 auto',
  },
});

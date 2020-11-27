import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { PatientForm } from './PatientForm';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { getPatientState, PatientState } from './state';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';

type Params = {
  editId: string | undefined;
};

export const EditPatientPage: React.FC<RouteComponentProps<Params>> = ({
  match: {
    params: { editId },
  },
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [formInitialState, setFormInitialState] = useState<PatientState>();

  useEffect(() => {
    getPatientState(editId).then((state) => setFormInitialState(state));
  }, [editId]);

  return (
    <>
      <div className={classes.container}>
        <div className={classes.title}>
          <Tooltip title="Go back" placement="top">
            <IconButton onClick={history.goBack}>
              <ChevronLeftIcon color="inherit" fontSize="large" />
            </IconButton>
          </Tooltip>
          <Typography variant="h4">
            {editId !== undefined ? 'Edit Patient' : 'New Patient'}
          </Typography>
        </div>
        <br />
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
  title: {
    display: `flex`,
    alignItems: `center`,
  },
});

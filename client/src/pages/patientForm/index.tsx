import { PatientState, getPatientState } from './state';
import { useEffect, useState } from 'react';

import LinearProgress from '@mui/material/LinearProgress';
import { PatientForm } from './PatientForm';
import makeStyles from '@mui/styles/makeStyles';
import { useRouteMatch } from 'react-router-dom';

type RouteParams = {
  patientId: string | undefined;
  editId: string;
  universalRecordId: string | undefined;
};

export const PatientFormPage = () => {
  const classes = useStyles();
  //universalRecordId stands for pregnancyId and medicalRecordId because they share the same route matching
  const { patientId, editId, universalRecordId } =
    useRouteMatch<RouteParams>().params;

  const [formInitialState, setFormInitialState] = useState<PatientState>();

  useEffect(() => {
    getPatientState(patientId, universalRecordId, editId).then((state) =>
      setFormInitialState(state)
    );
  }, [patientId, editId, universalRecordId]);

  return (
    <div className={classes.container}>
      {formInitialState === undefined ? (
        <LinearProgress />
      ) : (
        <PatientForm
          initialState={formInitialState}
          patientId={patientId}
          pregnancyId={universalRecordId}
          creatingNew={patientId === undefined}
          creatingNewPregnancy={
            patientId !== undefined && universalRecordId === undefined
          }
          editId={editId}
          universalRecordId={universalRecordId}
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

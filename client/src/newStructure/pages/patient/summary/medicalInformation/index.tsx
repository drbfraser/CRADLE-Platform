import { Action, actionCreators } from '../reducers';
import { EditedPatient, Patient } from '@types';

import { BasicInformation } from './basicInformation';
import Button from '@material-ui/core/Button/Button';
import { Divider } from 'semantic-ui-react';
import { GestationalAge } from './gestationalAge';
import Grid from '@material-ui/core/Grid';
import { HistoryItem } from './historyItem';
import Paper from '@material-ui/core/Paper';
import { PatientModal } from './patientModal';
import React from 'react';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import Typography from '@material-ui/core/Typography';
import { useStyles } from './styles';

interface IProps {
  displayPatientModal: boolean;
  editedPatient: EditedPatient;
  selectedPatient: Patient;
  onAddPatientRequired: (
    actionAfterAdding: () => void,
    message: string
  ) => void;
  updateState: React.Dispatch<Action>;
}

export const MedicalInformation: React.FC<IProps> = ({
  displayPatientModal,
  editedPatient,
  selectedPatient,
  onAddPatientRequired,
  updateState,
}) => {
  const classes = useStyles({
    history: Boolean(
      selectedPatient.drugHistory || selectedPatient.medicalHistory
    ),
  });

  const [patient, setPatient] = React.useState<Patient>(selectedPatient);

  React.useEffect((): void => {
    setPatient(selectedPatient);
  }, [selectedPatient]);

  React.useEffect((): void => {
    if (displayPatientModal) {
      updateState(actionCreators.initializeEditedPatient(patient));
    }
  }, [displayPatientModal, patient, updateState]);

  const openPatientModal = (): void => {
    onAddPatientRequired((): void => {
      updateState(actionCreators.openPatientModal());
    }, `You haven't added this patient to your health facility. You need to do that before you can edit this patient. Would like to add this patient?`);
  };

  return (
    <>
      <PatientModal
        displayPatientModal={displayPatientModal}
        patient={editedPatient}
        updateState={updateState}
      />
      <Grid className={classes.container} item={true} xs={6}>
        <Paper className={classes.paper}>
          <Typography className={classes.header} component="h3" variant="h5">
            <RecentActorsIcon fontSize="large" />
            Medical Information
          </Typography>
          <Divider />
          <div className={classes.content}>
            <BasicInformation patient={patient} />
            <GestationalAge
              gestationalAgeUnit={patient.gestationalAgeUnit}
              gestationalTimestamp={patient.gestationalTimestamp}
              pregnant={patient.isPregnant}
              updatePatient={setPatient}
            />
            <HistoryItem title="Drug history" history={patient.drugHistory} />
            <HistoryItem
              title="Medical history"
              history={patient.medicalHistory}
            />
            <Button variant="contained" onClick={openPatientModal}>
              Edit Patient
            </Button>
          </div>
        </Paper>
      </Grid>
    </>
  );
};

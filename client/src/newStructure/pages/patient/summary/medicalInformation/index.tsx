import { Action, actionCreators } from '../reducers';
import { EditedPatient, Patient } from '@types';
import { FormStatusEnum, GestationalAgeUnitEnum } from '../../../../enums';

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
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
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

  const dispatch = useDispatch();

  // * Allows toggling gestational age unit in medical information
  const [gestationalAgeUnit, setGestationalAgeUnit] = React.useState<
    GestationalAgeUnitEnum
  >(selectedPatient.gestationalAgeUnit);

  React.useEffect((): void => {
    if (displayPatientModal) {
      updateState(
        actionCreators.initializeEditedPatient({
          ...selectedPatient,
          gestationalAgeUnit,
        })
      );
    }
  }, [displayPatientModal, gestationalAgeUnit, selectedPatient, updateState]);

  React.useEffect((): void => {
    // * Allow edited patient gestational age unit to match selected patient
    updateState(
      actionCreators.editPatient({
        name: `gestationalAgeUnit`,
        value: gestationalAgeUnit,
      })
    );
  }, [gestationalAgeUnit, updateState]);

  const editPatientInformation = (): void => {
    onAddPatientRequired((): void => {
      dispatch(
        push(`/readings/new`, {
          patient: selectedPatient,
          status: FormStatusEnum.EDIT_PATIENT_INFORMATION,
        })
      );
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
            <BasicInformation patient={selectedPatient} />
            <GestationalAge
              gestationalAgeUnit={gestationalAgeUnit}
              gestationalTimestamp={selectedPatient.gestationalTimestamp}
              pregnant={selectedPatient.isPregnant}
              updateGestationalAgeUnit={setGestationalAgeUnit}
            />
            <HistoryItem
              title="Drug history"
              history={selectedPatient.drugHistory}
            />
            <HistoryItem
              title="Medical history"
              history={selectedPatient.medicalHistory}
            />
            <Button
              color="primary"
              variant="outlined"
              onClick={editPatientInformation}>
              Edit Patient
            </Button>
          </div>
        </Paper>
      </Grid>
    </>
  );
};

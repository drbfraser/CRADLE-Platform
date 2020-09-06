import { FormStatusEnum, GestationalAgeUnitEnum } from '../../../../enums';

import { BasicInformation } from './basicInformation';
import Button from '@material-ui/core/Button/Button';
import { Divider } from 'semantic-ui-react';
import { GestationalAge } from './gestationalAge';
import Grid from '@material-ui/core/Grid';
import { HistoryItem } from './historyItem';
import Paper from '@material-ui/core/Paper';
import { Patient } from '@types';
import React from 'react';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import Typography from '@material-ui/core/Typography';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { useStyles } from './styles';

interface IProps {
  selectedPatient: Patient;
  onAddPatientRequired: (
    actionAfterAdding: () => void,
    message: string
  ) => void;
}

export const MedicalInformation: React.FC<IProps> = ({
  selectedPatient,
  onAddPatientRequired,
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
  );
};

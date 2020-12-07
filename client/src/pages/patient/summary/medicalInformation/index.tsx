import { GestationalAgeUnitEnum } from '../../../../enums';

import { BasicInformation } from './basicInformation';
import { Divider } from 'semantic-ui-react';
import { GestationalAge } from './gestationalAge';
import { HistoryItem } from './historyItem';
import Paper from '@material-ui/core/Paper';
import { Patient } from '@types';
import React from 'react';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import Typography from '@material-ui/core/Typography';
import { useStyles } from './styles';

interface IProps {
  selectedPatient: Patient;
  onAddPatientRequired: (
    actionAfterAdding: () => void,
    message: string
  ) => void;
}

export const MedicalInformation: React.FC<IProps> = ({ selectedPatient }) => {
  const classes = useStyles({
    history: Boolean(
      selectedPatient.drugHistory || selectedPatient.medicalHistory
    ),
  });

  // * Allows toggling gestational age unit in medical information
  const [
    gestationalAgeUnit,
    setGestationalAgeUnit,
  ] = React.useState<GestationalAgeUnitEnum>(
    selectedPatient.gestationalAgeUnit
  );

  return (
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
      </div>
    </Paper>
  );
};

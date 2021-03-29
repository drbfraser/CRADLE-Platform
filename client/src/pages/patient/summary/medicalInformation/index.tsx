import { SexEnum } from 'src/enums';

import { Divider } from 'semantic-ui-react';
import { GestationalAge } from './gestationalAge';
import { HistoryItem } from './historyItem';
import Paper from '@material-ui/core/Paper';
import { Patient } from 'src/types';
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

  return (
    <Paper className={classes.paper}>
      <Typography className={classes.header} component="h3" variant="h5">
        <RecentActorsIcon fontSize="large" />
        Medical Information
      </Typography>
      <Divider />
      <div className={classes.content}>
        {selectedPatient.patientSex === SexEnum.FEMALE && (
          <p>
            <b>Pregnant: </b> {selectedPatient.isPregnant ? `Yes` : `No`}
          </p>
        )}
        <GestationalAge patient={selectedPatient} />
        <HistoryItem
          title="Drug history"
          history={selectedPatient.drugHistory}
        />
        <HistoryItem
          title="Medical history"
          history={selectedPatient.medicalHistory}
        />
        {selectedPatient.patientSex !== SexEnum.FEMALE &&
          !selectedPatient.drugHistory &&
          !selectedPatient.medicalHistory && (
            <>No additional medical information.</>
          )}
      </div>
    </Paper>
  );
};

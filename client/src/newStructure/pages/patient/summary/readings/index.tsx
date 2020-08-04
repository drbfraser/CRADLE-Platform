import { Patient, Reading } from '@types';

import Grid from '@material-ui/core/Grid';
import { Header } from './header';
import { Heart } from './heart';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import { ReferralInfo } from './referralInfo';
import { Symptoms } from './symptoms';
import { UrineTests } from './urineTests';
import { getTrafficIcon } from '../../../../shared/utils';
import { useReadings } from './hooks';
import { useStyles } from './styles';

interface IProps {
  selectedPatient: Patient;
  onAddPatientRequired: (
    actionAfterAdding: () => void,
    message: string
  ) => void;
}

export const PatientReadings: React.FC<IProps> = ({
  selectedPatient,
  onAddPatientRequired,
}) => {
  const classes = useStyles();

  const readings = useReadings(selectedPatient);

  return (
    <Grid className={classes.container} container={true} spacing={0}>
      {readings.map(
        (reading: Reading): JSX.Element => (
          <Grid key={reading.readingId} item={true} xs={12}>
            <Paper className={classes.paper}>
              <div>
                <Header dateTimeTaken={reading.dateTimeTaken} />
                <div className={classes.reading}>
                  {getTrafficIcon(reading.trafficLightStatus)}
                  <Heart reading={reading} />
                  <Symptoms symptoms={reading.symptoms} />
                  <UrineTests urineTests={reading.urineTests} />
                </div>
              </div>
              <ReferralInfo
                followUp={reading.followup}
                referral={reading.referral}
                selectedPatient={selectedPatient}
                onAddPatientRequired={onAddPatientRequired}
              />
            </Paper>
          </Grid>
        )
      )}
    </Grid>
  );
};

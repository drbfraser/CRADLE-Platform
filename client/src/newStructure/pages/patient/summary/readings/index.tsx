import { OrNull, Patient, Reading } from '@types';

import Grid from '@material-ui/core/Grid';
import { Header } from './header';
import { Heart } from './heart';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import { ReduxState } from '../../../../redux/rootReducer';
import { ReferralInfo } from './referralInfo';
import { Symptoms } from './symptoms';
import { UrineTests } from './urineTests';
import { getTrafficIcon } from '../../../../shared/utils';
import { useReadings } from './hooks';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';

interface IProps {
  selectedPatient: Patient;
}

export const PatientReadings: React.FC<IProps> = ({ selectedPatient }) => {
  const classes = useStyles();

  const referrals = useSelector(
    (state: ReduxState): OrNull<Record<string, any>> => {
      return state.referrals.mappedReferrals;
    }
  );

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
                readingId={reading.readingId}
                referral={referrals?.[reading.readingId]}
              />
            </Paper>
          </Grid>
        )
      )}
    </Grid>
  );
};

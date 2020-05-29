import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { getPrettyDateTime, getTrafficIcon } from '../../../utils';
import { ReferralInfo } from './referralInfo';
import { Reading } from '../../../../types';
import { UrineTests } from './urineTests';
import classes from './styles.module.css';

interface IProps {
  readings: Array<Reading>;
  referrals: any;
};

export const Readings: React.FC<IProps> = ({ readings, referrals }) => (
  <Grid container={ true } spacing={ 0 }>
    { readings.map((reading: Reading) => (
      <Grid key={ reading.readingId } xs={ 12 }>
        <Paper className={classes.paper}>
          <div className={classes.content}>
            <Typography variant="h4" component="h4">
              Reading
            </Typography>
            <Typography variant="subtitle1">
              Taken on { getPrettyDateTime(reading.dateTimeTaken) }
            </Typography>
            <div className={classes.items}>
              { getTrafficIcon(reading.trafficLightStatus) }
              <br />
              <br />
              <p>
                <b>Systolic Blood Pressure: </b> { reading.bpSystolic }{ ' ' }
              </p>
              <p>
                <b>Diastolic Blood Pressure: </b> { reading.bpDiastolic }{ ' ' }
              </p>
              <p>
                <b>Heart Rate (BPM): </b> { reading.heartRateBPM }{ ' ' }
              </p>
              <p>
                <b>Symptoms: </b> { reading.symptoms }{ ' ' }
              </p>
              <UrineTests reading={reading} />
            </div>
          </div>
          <div className={classes.referralInfoContainer}>
            <div className={classes.referralInfoContent}>
              <ReferralInfo
                readingId={ reading.readingId }
                referral={ referrals[reading.readingId] }
              />
            </div>
          </div>
        </Paper>
      </Grid>
    )) }
  </Grid>
);

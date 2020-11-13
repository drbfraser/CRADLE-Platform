import React from 'react';
import { Reading } from '@types';
import { useStyles } from './styles';

interface IProps {
  reading: Reading;
}

export const Heart: React.FC<IProps> = ({ reading }) => {
  const classes = useStyles();

  return (
    <div className={classes.heart}>
      <p>
        <b>Systolic Blood Pressure: </b> {reading.bpSystolic}
      </p>
      <p>
        <b>Diastolic Blood Pressure: </b> {reading.bpDiastolic}
      </p>
      <p>
        <b>Heart Rate (BPM): </b> {reading.heartRateBPM}
      </p>
    </div>
  );
};

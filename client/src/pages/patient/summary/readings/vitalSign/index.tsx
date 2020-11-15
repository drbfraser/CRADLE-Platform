import React from 'react';
import { Reading } from '@types';
import { useStyles } from './styles';

interface IProps {
  reading: Reading;
}

export const VitalSign: React.FC<IProps> = ({ reading }) => {
  const classes = useStyles();

  return (
    <div className={classes.vitalSign}>
      <p>
        <b>Systolic Blood Pressure: </b> {reading.bpSystolic}
      </p>
      <p>
        <b>Diastolic Blood Pressure: </b> {reading.bpDiastolic}
      </p>
      <p>
        <b>Heart Rate (BPM): </b> {reading.heartRateBPM}
      </p>
      {reading.respiratoryRate&&(
        <p>
        <b>Respiratory Rate: </b> {reading.respiratoryRate}
        </p>
      )}
      {reading.oxygenSaturation&&(
        <p>
        <b>Oxygen Saturation: </b> {reading.oxygenSaturation}
        </p>
      )}
      {reading.temperature&&(
        <p>
        <b>Temperature: </b> {reading.temperature}
        </p>
      )}
    </div>
  );
};

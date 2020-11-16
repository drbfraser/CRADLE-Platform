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
        <b>Systolic Blood Pressure: </b> {reading.bpSystolic} mm/Hg
      </p>
      <p>
        <b>Diastolic Blood Pressure: </b> {reading.bpDiastolic} mm/Hg
      </p>
      <p>
        <b>Heart Rate: </b> {reading.heartRateBPM} bpm
      </p>
      {reading.respiratoryRate && (
        <p>
          <b>Respiratory Rate: </b> {reading.respiratoryRate} bpm
        </p>
      )}
      {reading.oxygenSaturation && (
        <p>
          <b>Oxygen Saturation: </b> {reading.oxygenSaturation}%
        </p>
      )}
      {reading.temperature && (
        <p>
          <b>Temperature: </b> {reading.temperature}°C
        </p>
      )}
    </div>
  );
};

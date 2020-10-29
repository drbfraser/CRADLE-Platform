import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { PatientRow } from './PatientRow';
import { IPatient } from './types';

interface IProps {
  patients: IPatient[];
}

export const PatientTable = ({ patients }: IProps) => {
  const classes = useStyles();

  return (
    <table className={classes.table}>
      <thead>
        <tr className={classes.headRow}>
          <th>Patient Name</th>
          <th>Patient ID</th>
          <th>Village</th>
          <th>Vital Sign</th>
          <th>Last Reading Date</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((p) => (
          <PatientRow key={p.patientId} patient={p} />
        ))}
      </tbody>
    </table>
  );
};

const useStyles = makeStyles({
  table: {
    width: '100%',
    textAlign: 'center',
  },
  headRow: {
    height: '60px',
  },
});

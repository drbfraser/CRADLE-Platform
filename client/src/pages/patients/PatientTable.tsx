import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { PatientRow } from './PatientRow';
import { IPatient, SortDir } from './types';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import SortIcon from '@material-ui/icons/Sort';

interface IProps {
  patients: IPatient[];
  sortBy: string;
  sortDir: string;
  setSortBy: (col: string) => void;
  setSortDir: (dir: SortDir) => void;
}

const columns = {
  patientName: 'Patient Name',
  patientId: 'Patient ID',
  villageNumber: 'Village',
  trafficLightStatus: 'Vital Sign',
  dateTimeTaken: 'Last Reading Date',
};

export const PatientTable = ({
  patients,
  sortBy,
  sortDir,
  setSortBy,
  setSortDir,
}: IProps) => {
  const classes = useStyles();

  const handleSort = (col: string) => {
    if (col === sortBy) {
      // swap direction
      setSortDir(sortDir === SortDir.ASC ? SortDir.DESC : SortDir.ASC);
    } else {
      setSortBy(col);
      setSortDir(SortDir.ASC);
    }
  };

  return (
    <table className={classes.table}>
      <thead>
        <tr className={classes.headRow}>
          {Object.entries(columns).map(([col, name]) => (
            <th key={col}>
              {name}
              <div className={classes.sortIcon} onClick={() => handleSort(col)}>
                {sortBy === col ? (
                  sortDir === SortDir.ASC ? (
                    <ArrowDownwardIcon />
                  ) : (
                    <ArrowUpwardIcon />
                  )
                ) : (
                  <SortIcon />
                )}
              </div>
            </th>
          ))}
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
  sortIcon: {
    display: 'inline-block',
    color: '#888',
    marginLeft: 10,
    padding: 3,
    borderRadius: '50%',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#eee',
    },
  },
});

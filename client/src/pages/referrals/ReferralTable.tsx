import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { ReferralRow } from './ReferralRow';
import { IReferral, SortDir } from './types';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import SortIcon from '@material-ui/icons/Sort';
import IconButton from '@material-ui/core/IconButton';

interface IProps {
  referrals: IReferral[];
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
  dateReferred: 'Date Referred',
  isAssessed: 'Assessment',
};

export const ReferralTable = ({
  referrals,
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
            <th className={classes.headCell} key={col}>
              {name}
              <IconButton onClick={() => handleSort(col)}>
                {sortBy === col ? (
                  sortDir === SortDir.ASC ? (
                    <ArrowDownwardIcon />
                  ) : (
                    <ArrowUpwardIcon />
                  )
                ) : (
                  <SortIcon />
                )}
              </IconButton>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {referrals.map((r) => (
          <ReferralRow key={r.referralId} referral={r} />
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
  headCell: {
    backgroundColor: '#fff',
    position: 'sticky',
    top: 0,
  },
});

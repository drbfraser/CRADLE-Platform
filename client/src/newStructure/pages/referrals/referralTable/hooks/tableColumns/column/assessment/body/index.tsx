import AccessTimeIcon from '@material-ui/icons/AccessTime';
import DoneIcon from '@material-ui/icons/Done';
import React from 'react';
import { Reading } from '@types';
import { getLatestReferralAssessed } from '../utils';
import { useStyles } from './styles';

interface IProps {
  className: string;
  readings: Array<Reading>;
}

export const AssessmentBody: React.FC<IProps> = ({ className, readings }) => {
  const classes = useStyles();

  return getLatestReferralAssessed(readings) ? (
    <span className={`${className} ${classes.container}`}>
      <DoneIcon className={classes.complete} />
      <span>Complete</span>
    </span>
  ) : (
    <span className={`${className} ${classes.container}`}>
      <AccessTimeIcon className={classes.pending} />
      <span>Pending</span>
    </span>
  );
};

import AccessTimeIcon from '@material-ui/icons/AccessTime';
import DoneIcon from '@material-ui/icons/Done';
import React from 'react';
import { useStyles } from './styles';

interface IProps {
  className: string;
  needsAssessment: boolean;
}

export const AssessmentBody: React.FC<IProps> = ({
  className,
  needsAssessment,
}) => {
  const classes = useStyles();

  return needsAssessment ? (
    <span className={`${className} ${classes.container}`}>
      <AccessTimeIcon className={classes.pending} />
      <span>Pending</span>
    </span>
  ) : (
    <span className={`${className} ${classes.container}`}>
      <DoneIcon className={classes.complete} />
      <span>Complete</span>
    </span>
  );
};

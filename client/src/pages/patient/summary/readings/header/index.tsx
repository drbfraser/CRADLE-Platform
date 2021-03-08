import AssessmentIcon from '@material-ui/icons/Assessment';
import { OrNull } from 'src/types';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { getPrettyDateTime } from 'src/shared/utils';
import { useStyles } from './styles';

interface IProps {
  dateTimeTaken: OrNull<number>;
}

export const Header: React.FC<IProps> = ({ dateTimeTaken }) => {
  const classes = useStyles();

  return (
    <>
      <Typography className={classes.header} component="h3" variant="h5">
        <AssessmentIcon fontSize="large" />
        Reading
      </Typography>
      {dateTimeTaken ? (
        <Typography variant="subtitle1">
          Taken on {getPrettyDateTime(dateTimeTaken)}
        </Typography>
      ) : null}
    </>
  );
};

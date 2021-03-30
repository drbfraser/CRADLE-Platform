import React from 'react';
import { Statistic } from 'semantic-ui-react';
import { makeStyles } from '@material-ui/core/styles';

interface CardProps {
  label: string;
  data?: number;
}

export const StatisticCard: React.FC<CardProps> = ({ label, data }) => {
  const classes = useStyles();

  return (
    <Statistic horizontal className={classes.statistic}>
      <Statistic.Value>{data}</Statistic.Value>
      <Statistic.Label className={classes.verticalWriting}>
        {label}
      </Statistic.Label>
    </Statistic>
  );
};

const useStyles = makeStyles((theme) => ({
  statistic: {
    width: 200,
    padding: theme.spacing(1, 0, 1, 2),
    border: `1px solid rgb(211, 205, 205)`,
    borderRadius: 7,
    boxShadow: `3px 1px rgb(211, 205, 205)`,
  },
  verticalWriting: {
    width: 100,
    margin: theme.spacing(0, `auto`),
  },
}));

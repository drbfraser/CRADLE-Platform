import React from 'react';
import { Statistic as SemanticStatistic } from 'semantic-ui-react';
import { YearGlobalStatistics } from '@types';
import { useCurrentMonthContext } from '../context/currentMonth/hooks';
import { useStyles } from '../styles';

interface IProps {
  label: string;
  data?: YearGlobalStatistics;
  underlineClassName: string;
}

export const Statistic: React.FC<IProps> = ({
  label,
  underlineClassName,
  data,
}) => {
  const classes = useStyles();

  const currentMonth = useCurrentMonthContext();

  return (
    <SemanticStatistic horizontal className={classes.statistic}>
      <SemanticStatistic.Value className={underlineClassName}>
        {data?.[currentMonth - 1]}
      </SemanticStatistic.Value>
      <SemanticStatistic.Label className={classes.verticalWriting}>
        {label}
      </SemanticStatistic.Label>
    </SemanticStatistic>
  );
};

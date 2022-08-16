import { Statistic } from 'semantic-ui-react';
import { useStatisticsStyles } from './statisticStyles';

interface CardProps {
  label: string;
  data?: number;
}

export const StatisticCard: React.FC<CardProps> = ({ label, data }) => {
  const classes = useStatisticsStyles();

  return (
    <Statistic horizontal className={classes.statistic}>
      <Statistic.Value>{data}</Statistic.Value>
      <Statistic.Label className={classes.verticalWriting}>
        {label}
      </Statistic.Label>
    </Statistic>
  );
};

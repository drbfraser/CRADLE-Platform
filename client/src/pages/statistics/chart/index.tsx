import { StatisticsDataset, YearGlobalStatistics } from '@types';

import { Card } from 'semantic-ui-react';
import { Line } from 'react-chartjs-2';
import React from 'react';
import { useChart } from './hooks';
import { useStyles } from '../styles';

interface IProps {
  datasets: Array<StatisticsDataset<string, YearGlobalStatistics>>;
}

export const Chart: React.FC<IProps> = ({ datasets }) => {
  const classes = useStyles();

  const data = useChart({ datasets });

  return (
    <div className={classes.chart}>
      <Card fluid={true}>
        <Card.Content>
          <Line data={data} />
        </Card.Content>
      </Card>
    </div>
  );
};

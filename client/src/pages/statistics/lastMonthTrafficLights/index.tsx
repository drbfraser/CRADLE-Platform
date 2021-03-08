import { OrNull, Statistics } from 'src/types';

import { Bar } from 'react-chartjs-2';
import { Card } from 'semantic-ui-react';
import { Loader } from 'src/shared/components/loader';
import React from 'react';
import { useChart } from './hooks';
import { useStyles as useLocalStyles } from './styles';
import { useStyles } from '../styles';

interface IProps {
  error: boolean;
  loading: boolean;
  statistics: OrNull<Statistics>;
}

export const LastMonthTrafficLightsStatistics: React.FC<IProps> = ({
  error,
  loading,
  statistics,
}) => {
  const classes = { ...useStyles(), ...useLocalStyles() };
  const data = useChart({
    statistics: statistics?.trafficLightStatusLastMonth,
  });

  if (loading) {
    return <Loader message="Getting traffic light statistics..." show={true} />;
  }

  if (error) {
    return null;
  }

  return (
    <div>
      <h2 className={classes.header}>Traffic lights from last month:</h2>
      <div className={classes.center}>
        <div className={classes.chart}>
          <Card fluid={true}>
            <Card.Content>
              <Bar
                data={data}
                options={{
                  legend: { display: false },
                  scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
                }}
              />
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

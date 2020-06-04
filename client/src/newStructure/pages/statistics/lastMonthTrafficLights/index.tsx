import { Bar } from 'react-chartjs-2';
import { Card } from 'semantic-ui-react';
import React from 'react';
import classes from '../styles.module.css';
import styles from './styles.module.css';
import { trafficLightLabels } from './utils';

interface IProps {
  statisticsList: any;
}

export const LastMonthTrafficLightsStatistics: React.FC<IProps> = ({
  statisticsList
}) => {
  const trafficLight = 
    statisticsList.trafficLightStatusLastMonth
      ? {
          labels: trafficLightLabels,
          datasets: [
            {
              backgroundColor: [`green`, `yellow`, `yellow`, `red`, `red`],
              data: Object.values(statisticsList.trafficLightStatusLastMonth)
            }
          ]
        }
      : {};

  return (
    <div>
      <h2 className={styles.header}>Traffic lights from last month:</h2>
      <div className={classes.center}>
        <div className="chart">
          <Card fluid>
            <Card.Content>
              <Bar
                data={trafficLight}
                options={{
                  legend: { display: false },
                  scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                }}
              />
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

import { Card, Statistic } from 'semantic-ui-react';
import { Line } from 'react-chartjs-2';

import React from 'react';
import classes from '../styles.module.css';
import { xLabels } from '../utils';
import { readingsPerMonth, referralsPerMonth, assessmentsPerMonth } from './utils';

interface IProps {
  currentMonth: number;
  statisticsList: any;
}

export const GlobalStatistics: React.FC<IProps> = ({
  currentMonth,
  statisticsList
}) => { 
  const readingsVsReferralsVsAssessment = {
    labels: xLabels,
    datasets: [
      readingsPerMonth(statisticsList.readingsPerMonth),
      referralsPerMonth(statisticsList.referralsPerMonth),
      assessmentsPerMonth(statisticsList.assessmentsPerMonth)
    ]
  };
  
  return (
  <>
    <h1 className={classes.headerSize}>Global Statistics</h1>
    <div>
      <h2>In the last month, there were:</h2>
      <div className={classes.center}>
        {statisticsList.readingsPerMonth &&
        statisticsList.referralsPerMonth &&
        statisticsList.assessmentsPerMonth ? (
          <Statistic.Group className={classes.statisticGroup}>
            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value className={classes.underlineBlue}>
                {statisticsList.readingsPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                READINGS TAKEN
              </Statistic.Label>
            </Statistic>

            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value className={classes.underlinePurple}>
                {statisticsList.referralsPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                REFERRALS SENT
              </Statistic.Label>
            </Statistic>

            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value className={classes.underlineOrange}>
                {statisticsList.assessmentsPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                ASSESSMENTS MADE
              </Statistic.Label>
            </Statistic>
          </Statistic.Group>
        ) : null}
        <div className="chart">
          <Card fluid className="chart">
            <Card.Content>
              <Line data={readingsVsReferralsVsAssessment} />
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  </>
);};

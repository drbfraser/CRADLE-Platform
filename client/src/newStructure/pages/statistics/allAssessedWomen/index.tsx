import { Card, Statistic } from 'semantic-ui-react';
import {
  pregnantWomenAssessedPerMonth,
  pregnantWomenReferredPerMonth,
  womenAssessedPerMonth,
  womenReferredPerMonth
} from './utils';

import { Line } from 'react-chartjs-2';
import React from 'react';
import classes from '../styles.module.css';
import { xLabels } from '../utils';

interface IProps {
  currentMonth: number;
  statisticsList: any;
}

export const AllAssessedWomenStatsitics: React.FC<IProps> = ({
  currentMonth,
  statisticsList
}) => {
  const womenReferralsVsAssessed = {
    labels: xLabels,
    datasets: [
      womenReferredPerMonth(statisticsList.womenReferredPerMonth),
      pregnantWomenReferredPerMonth(
        statisticsList.pregnantWomenReferredPerMonth
      ),
      womenAssessedPerMonth(statisticsList.womenAssessedPerMonth),
      pregnantWomenAssessedPerMonth(
        statisticsList.pregnantWomenAssessedPerMonth
      )
    ]
  };

  return (
    <div>
      <h2>A snapshot of all women assessed:</h2>
      <div className={classes.center}>
        {statisticsList.womenReferredPerMonth &&
        statisticsList.pregnantWomenReferredPerMonth &&
        statisticsList.womenAssessedPerMonth &&
        statisticsList.pregnantWomenAssessedPerMonth ? (
          <Statistic.Group className={classes.statisticGroup}>
            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value className={classes.underlineBlack}>
                {statisticsList.womenReferredPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                WOMEN REFERRED
              </Statistic.Label>
            </Statistic>
            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value className={classes.underlineBlue}>
                {statisticsList.pregnantWomenReferredPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                PREGNANT WOMEN REFERRED
              </Statistic.Label>
            </Statistic>
            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value className={classes.underlinePurple}>
                {statisticsList.womenAssessedPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                WOMEN ASSESSED
              </Statistic.Label>
            </Statistic>
            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value className={classes.underlineOrange}>
                {statisticsList.pregnantWomenAssessedPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                PREGNANT WOMEN ASSESSED
              </Statistic.Label>
            </Statistic>
          </Statistic.Group>
        ) : null}
        <div className="chart">
          <Card fluid>
            <Card.Content>
              <Line data={womenReferralsVsAssessed} />
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

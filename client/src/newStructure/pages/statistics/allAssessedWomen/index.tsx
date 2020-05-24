import React from 'react';
import classes from '../styles.module.css';
import { Line } from 'react-chartjs-2';
import { Card, Statistic } from 'semantic-ui-react';
import { xLabels } from '../utils';
import {
  womenReferredPerMonth,
  pregnantWomenReferredPerMonth,
  womenAssessedPerMonth,
  pregnantWomenAssessedPerMonth
} from './utils';

interface IProps {
  currentMonth: number;
  statisticsList: any;
}

export const AllAssessedWomenStatsitics: React.FC<IProps> = ({
  currentMonth,
  statisticsList
}) => {
  const womenReferralsVsAssessed = React.useRef({
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
  });

  return (
    <div>
      <h2>A snapshot of all women assessed:</h2>
      <div className={classes.center}>
        {statisticsList.womenReferredPerMonth &&
        statisticsList.pregnantWomenReferredPerMonth &&
        statisticsList.womenAssessedPerMonth &&
        statisticsList.pregnantWomenAssessedPerMonth ? (
          <Statistic.Group
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingBottom: 20
            }}>
            <Statistic horizontal className={classes.statSubBox}>
              <Statistic.Value className={classes.underlineBlack}>
                {statisticsList.womenReferredPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                WOMEN REFERRED
              </Statistic.Label>
            </Statistic>
            <Statistic horizontal className={classes.statSubBox}>
              <Statistic.Value className={classes.underlineBlue}>
                {statisticsList.pregnantWomenReferredPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                PREGNANT WOMEN REFERRED
              </Statistic.Label>
            </Statistic>
            <Statistic horizontal className={classes.statSubBox}>
              <Statistic.Value className={classes.underlinePurple}>
                {statisticsList.womenAssessedPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                WOMEN ASSESSED
              </Statistic.Label>
            </Statistic>
            <Statistic horizontal className={classes.statSubBox}>
              <Statistic.Value className={classes.underlineOrange}>
                {statisticsList.pregnantWomenAssessedPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                PREGNANT WOMEN ASSESSED
              </Statistic.Label>
            </Statistic>
          </Statistic.Group>
        ) : null}
        <br />
        <div className={classes.chartBox}>
          <Card fluid>
            <Card.Content>
              <Line data={womenReferralsVsAssessed.current} />
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

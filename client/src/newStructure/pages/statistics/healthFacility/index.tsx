import { Statistic } from 'semantic-ui-react';

import React from 'react';
import classes from '../styles.module.css';

interface IProps {
  currentMonth: number;
  statisticsList: any;
}

export const HealthFacilityStatistics: React.FC<IProps> = ({
  currentMonth,
  statisticsList
}) => (
  <>
    <h1 className={classes.headerSize}>Our Health Facility’s Statistics</h1>
    <div>
      <h2>In the last month, our health facility assessed:</h2>
      <div className={classes.center}>
        {statisticsList.uniquePeopleAssesedPerMonth ||
        statisticsList.womenAssessedPerMonth ||
        statisticsList.pregnantWomenAssessedPerMonth ? (
          <Statistic.Group className={classes.statisticGroup}>
            <Statistic horizontal={true} className={classes.statistic}>
              <Statistic.Value className={classes.underlineBlue}>
                {statisticsList.uniquePeopleAssesedPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label>PEOPLE</Statistic.Label>
            </Statistic>

            <Statistic horizontal={true} className={classes.statistic}>
              <Statistic.Value className={classes.underlineBlue}>
                {statisticsList.womenAssessedPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label>WOMEN</Statistic.Label>
            </Statistic>

            <Statistic horizontal={true} className={classes.statistic}>
              <Statistic.Value className={classes.underlineBlue}>
                {statisticsList.pregnantWomenAssessedPerMonth[currentMonth - 1]}
              </Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                PREGNANT WOMEN
              </Statistic.Label>
            </Statistic>
          </Statistic.Group>
        ) : null}
      </div>
    </div>
  </>
);

import { OrNull, Statistics } from '@types';
import {
  pregnantWomenAssessedPerMonth,
  pregnantWomenReferredPerMonth,
  womenAssessedPerMonth,
  womenReferredPerMonth,
} from './utils';

import { Chart } from '../chart';
import { Loader } from '../../../shared/components/loader';
import React from 'react';
import { Statistic as SemanticStatistic } from 'semantic-ui-react';
import { Statistic } from '../statistic';
import { useStyles } from '../styles';

interface IProps {
  error: boolean;
  loading: boolean;
  statistics: OrNull<Statistics>;
}

export const AllAssessedWomenStatsitics: React.FC<IProps> = ({
  error,
  loading,
  statistics,
}) => {
  const classes = useStyles();

  if (loading) {
    return (
      <Loader message="Getting assessed women statistics..." show={true} />
    );
  }

  if (error) {
    return null;
  }

  return (
    <div>
      <h2>A snapshot of all women assessed:</h2>
      <div className={classes.center}>
        <SemanticStatistic.Group className={classes.statisticGroup}>
          <Statistic
            label="WOMEN REFERRED"
            data={statistics?.womenReferredPerMonth}
            underlineClassName={classes.underlineBlack}
          />
          <Statistic
            label="PREGNANT WOMEN REFERRED"
            data={statistics?.pregnantWomenReferredPerMonth}
            underlineClassName={classes.underlineBlue}
          />
          <Statistic
            label="WOMEN ASSESSED"
            data={statistics?.womenAssessedPerMonth}
            underlineClassName={classes.underlinePurple}
          />
          <Statistic
            label="PREGNANT WOMEN ASSESSED"
            data={statistics?.pregnantWomenAssessedPerMonth}
            underlineClassName={classes.underlineOrange}
          />
        </SemanticStatistic.Group>
        {statistics && (
          <Chart
            datasets={[
              womenReferredPerMonth(statistics.womenReferredPerMonth),
              pregnantWomenReferredPerMonth(
                statistics.pregnantWomenReferredPerMonth
              ),
              womenAssessedPerMonth(statistics.womenAssessedPerMonth),
              pregnantWomenAssessedPerMonth(
                statistics.pregnantWomenAssessedPerMonth
              ),
            ]}
          />
        )}
      </div>
    </div>
  );
};

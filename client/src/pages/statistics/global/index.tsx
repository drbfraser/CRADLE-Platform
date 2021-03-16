import { OrNull, Statistics } from 'src/types';
import {
  assessmentsPerMonth,
  readingsPerMonth,
  referralsPerMonth,
} from './utils';

import { Chart } from '../chart';
import { Loader } from 'src/shared/components/loader';
import React from 'react';
import { Statistic as SemanticStatistic } from 'semantic-ui-react';
import { Statistic } from '../statistic';
import { useStyles } from '../styles';

interface IProps {
  error: boolean;
  loading: boolean;
  statistics: OrNull<Statistics>;
}

export const GlobalStatistics: React.FC<IProps> = ({
  error,
  loading,
  statistics,
}) => {
  const classes = useStyles();

  if (loading) {
    return <Loader message="Getting global statistics..." show={true} />;
  }

  if (error) {
    return null;
  }

  return (
    <div>
      <h1 className={classes.headerSize}>Global Statistics</h1>
      <div>
        <h2>In the last month, there were:</h2>
        <div className={classes.center}>
          <SemanticStatistic.Group className={classes.statisticGroup}>
            <Statistic
              label="READINGS TAKEN"
              data={statistics?.readingsPerMonth}
              underlineClassName={classes.underlineBlue}
            />
            <Statistic
              label="REFERRALS SENT"
              data={statistics?.referralsPerMonth}
              underlineClassName={classes.underlinePurple}
            />
            <Statistic
              label="ASSESSMENTS MADE"
              data={statistics?.assessmentsPerMonth}
              underlineClassName={classes.underlineOrange}
            />
          </SemanticStatistic.Group>
          {statistics && (
            <Chart
              datasets={[
                readingsPerMonth(statistics.readingsPerMonth),
                referralsPerMonth(statistics.referralsPerMonth),
                assessmentsPerMonth(statistics.assessmentsPerMonth),
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

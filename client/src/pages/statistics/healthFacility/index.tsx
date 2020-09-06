import { OrNull, Statistics } from '@types';

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

export const HealthFacilityStatistics: React.FC<IProps> = ({
  error,
  loading,
  statistics,
}) => {
  const classes = useStyles();

  if (loading) {
    return (
      <Loader message="Getting health facility statistics..." show={true} />
    );
  }

  if (error) {
    return null;
  }

  return (
    <div>
      <h1 className={classes.headerSize}>Our Health Facility’s Statistics</h1>
      <div>
        <h2>In the last month, our health facility assessed:</h2>
        <div className={classes.center}>
          <SemanticStatistic.Group className={classes.statisticGroup}>
            <Statistic
              data={statistics?.uniquePeopleAssesedPerMonth}
              label="PEOPLE"
              underlineClassName={classes.underlineBlue}
            />
            <Statistic
              data={statistics?.womenAssessedPerMonth}
              label="WOMEN"
              underlineClassName={classes.underlineBlue}
            />
            <Statistic
              data={statistics?.pregnantWomenAssessedPerMonth}
              label="PREGNANT WOMEN"
              underlineClassName={classes.underlineBlue}
            />
          </SemanticStatistic.Group>
        </div>
      </div>
    </div>
  );
};

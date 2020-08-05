import { Statistics as GlobalStatisticsType, OrNull } from '@types';
import {
  clearStatisticsRequestOutcome,
  getStatistics,
} from '../../redux/reducers/statistics';
import { useDispatch, useSelector } from 'react-redux';

import { AllAssessedWomenStatsitics } from './allAssessedWomen';
import { CurrentMonthContextProvider } from './context/currentMonth';
import { GlobalStatistics } from './global';
import { HealthFacilityStatistics } from './healthFacility';
import { LastMonthTrafficLightsStatistics } from './lastMonthTrafficLights';
import React from 'react';
import { ReduxState } from '../../redux/reducers';
import { Toast } from '../../shared/components/toast';
import { useStyles } from './styles';

type SelectorState = {
  error: boolean;
  loading: boolean;
  message: OrNull<string>;
  statistics: OrNull<GlobalStatisticsType>;
};

export const StatisticsPage: React.FC = () => {
  const classes = useStyles();

  const { error, loading, message, statistics } = useSelector(
    ({ statistics }: ReduxState): SelectorState => ({
      error: statistics.error,
      loading: statistics.loading,
      message: statistics.message,
      statistics: statistics.data,
    })
  );

  const dispatch = useDispatch();

  React.useEffect((): void => {
    dispatch(getStatistics());
  }, [dispatch]);

  const clearError = (): void => {
    dispatch(clearStatisticsRequestOutcome());
  };

  return (
    <>
      <Toast status="error" message={message} clearMessage={clearError} />
      <CurrentMonthContextProvider>
        <div className={classes.container}>
          <HealthFacilityStatistics
            error={error}
            loading={loading}
            statistics={statistics}
          />
          <GlobalStatistics
            error={error}
            loading={loading}
            statistics={statistics}
          />
          <AllAssessedWomenStatsitics
            error={error}
            loading={loading}
            statistics={statistics}
          />
          <LastMonthTrafficLightsStatistics
            error={error}
            loading={loading}
            statistics={statistics}
          />
        </div>
      </CurrentMonthContextProvider>
    </>
  );
};

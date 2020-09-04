import React from 'react';
import { TrafficLightStatistics } from '@types';
import { trafficLightLabels } from './utils';

interface IArgs {
  statistics?: TrafficLightStatistics;
}

interface IUseChartData {
  labels: typeof trafficLightLabels;
  datasets:
    | [
        {
          backgroundColor: ['green', 'yellow', 'yellow', 'red', 'red'];
          data: Array<number>;
        }
      ]
    | [];
}

export const useChart = ({ statistics }: IArgs): IUseChartData => {
  return React.useMemo((): IUseChartData => {
    return {
      labels: trafficLightLabels,
      datasets: statistics
        ? [
            {
              backgroundColor: [`green`, `yellow`, `yellow`, `red`, `red`],
              data: Object.values(statistics),
            },
          ]
        : [],
    };
  }, [statistics]);
};

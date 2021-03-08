import { OrNull, PatientStatistics, StatisticsDataset } from 'src/types';

import { ReduxState } from 'src/redux/reducers';
import { TrafficLightEnum } from 'src/enums';
import { useSelector } from 'react-redux';

type TrafficLights = {
  labels: Array<string>;
  datasets: Array<
    StatisticsDataset<
      undefined,
      Array<number>,
      ['green', 'yellow', 'yellow', 'red', 'red']
    >
  >;
};

export const useTrafficLights = (): OrNull<TrafficLights> => {
  const statistics = useSelector(
    (state: ReduxState): OrNull<PatientStatistics> =>
      state.patientStatistics.data
  );

  return statistics?.trafficLightCountsFromDay1
    ? {
        labels: Object.values(TrafficLightEnum)
          .filter(
            (value: TrafficLightEnum): boolean =>
              value !== TrafficLightEnum.NONE
          )
          .map((value: TrafficLightEnum): string => value.replace(/_/g, ` `)),
        datasets: [
          {
            backgroundColor: [`green`, `yellow`, `yellow`, `red`, `red`],
            data: Object.values(statistics.trafficLightCountsFromDay1),
          },
        ],
      }
    : null;
};

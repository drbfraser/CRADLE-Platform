import { OrNull, PatientStatistics } from '@types';

import { ReduxState } from '../../../../../../redux/reducers';
import { TrafficLightEnum } from '../../../../../../enums';
import { useSelector } from 'react-redux';

type Dataset = {
  backgroundColor: ['red', 'red', 'yellow', 'yellow', 'green'];
  data: Array<number>;
};

type TrafficLights = {
  labels: Array<string>;
  datasets: Array<Dataset>;
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
            backgroundColor: [`red`, `red`, `yellow`, `yellow`, `green`],
            data: Object.values(statistics.trafficLightCountsFromDay1),
          },
        ],
      }
    : null;
};

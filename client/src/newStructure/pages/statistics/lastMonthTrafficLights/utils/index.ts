import { TrafficLightEnum } from '../../../../enums';

export const trafficLightLabels = Object.values(TrafficLightEnum)
  .filter(
    (trafficLight: TrafficLightEnum): boolean =>
      trafficLight !== TrafficLightEnum.NONE
  )
  .map((trafficLight: TrafficLightEnum): string =>
    trafficLight.replace(/_/g, ` `)
  );

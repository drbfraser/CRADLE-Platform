import {
  calculateShockIndex,
  getLatestReading,
  getLatestReadingWithReferral,
} from '../../../../../../../../shared/utils';

import React from 'react';
import { Reading } from '@types';
import { TrafficLight } from '../../../../../../../../shared/components/trafficLight';
import { TrafficLightEnum } from '../../../../../../../../enums';

interface IProps {
  className: string;
  readings: Array<Reading>;
}

export const VitalSignBody: React.FC<IProps> = ({
  className,
  readings,
}: IProps) => {
  const status = React.useMemo((): TrafficLightEnum => {
    const latestReading = getLatestReading(readings);

    return (
      getLatestReadingWithReferral(readings)?.trafficLightStatus ??
      calculateShockIndex(latestReading)
    );
  }, [readings]);

  return <TrafficLight className={className} status={status} />;
};

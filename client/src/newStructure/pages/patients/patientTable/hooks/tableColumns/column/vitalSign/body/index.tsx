import React from 'react';
import { Reading } from '@types';
import { TrafficLight } from '../../../../../../../../shared/components/trafficLight';
import { TrafficLightEnum } from '../../../../../../../../enums';
import { getFirstReadingWithTrafficLight } from '../utils';

interface IProps {
  className: string;
  readings: Array<Reading>;
}

export const VitalSignBody: React.FC<IProps> = ({
  className,
  readings,
}: IProps) => {
  const status = React.useMemo((): TrafficLightEnum => {
    return getFirstReadingWithTrafficLight(readings).trafficLightStatus;
  }, [readings]);

  return <TrafficLight className={className} status={status} />;
};

import React from 'react';
import { Reading } from '@types';
import { TrafficLight } from '../../../../../../../../shared/components/trafficLight';
import { TrafficLightEnum } from '../../../../../../../../enums';
import { getFirstReadingWithTrafficLight } from '../utils';
import { useStyles } from '../../../../../../../../shared/components/table/column/trafficLights';

interface IProps {
  className: string;
  readings: Array<Reading>;
}

export const VitalSignBody: React.FC<IProps> = ({
  className,
  readings,
}: IProps) => {
  const classes = useStyles();

  const status = React.useMemo((): TrafficLightEnum => {
    return getFirstReadingWithTrafficLight(readings).trafficLightStatus;
  }, [readings]);

  return (
    <TrafficLight
      className={`${className} ${
        status === TrafficLightEnum.GREEN || status === TrafficLightEnum.NONE
          ? ``
          : classes.offsetTrafficLight
      }`}
      status={status}
    />
  );
};

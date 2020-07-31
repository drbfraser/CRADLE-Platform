import React from 'react';
import { Reading } from '@types';
import { TrafficLightEnum } from '../../../../../../../../enums';
import { getFirstReadingWithTrafficLight } from '../utils';
import { getTrafficIcon } from '../../../../../../../../shared/utils';
import { useStyles } from './styles';

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
    <div className={`${className} ${classes.vitalSign}`}>
      {getTrafficIcon(status)}
    </div>
  );
};

import { Callback, GlobalSearchPatient, Patient } from '@types';
import { SortOrderEnum, TrafficLightEnum } from '../../../../../../../../enums';

import React from 'react';
import { SortToggle } from '../../../../../../../../shared/components/sortToggle';
import { getFirstReadingWithTrafficLight } from '../utils';
import orderBy from 'lodash/orderBy';

interface IProps {
  className: string;
  data: Array<Patient> | Array<GlobalSearchPatient>;
  sortData: Callback<Array<Patient> | Array<GlobalSearchPatient>>;
  label?: string;
}

export const VitalSignHead: React.FC<IProps> = ({
  className,
  data,
  label,
  sortData,
}) => {
  const trafficLights = React.useRef<Array<TrafficLightEnum>>(
    Object.values(TrafficLightEnum)
  );

  const [sortOrder, setSortOrder] = React.useState<SortOrderEnum>(
    SortOrderEnum.ASC
  );
  const [sorted, setSorted] = React.useState<boolean>(false);

  React.useEffect((): void => {
    if (sorted) {
      setSortOrder(
        (currentOrder: SortOrderEnum): SortOrderEnum => {
          return currentOrder === SortOrderEnum.ASC
            ? SortOrderEnum.DESC
            : SortOrderEnum.ASC;
        }
      );
      setSorted(false);
    }
  }, [sorted]);

  const handleClick = (): void => {
    const getTrafficLightIndex = ({ readings }: Patient): number => {
      return trafficLights.current.indexOf(
        getFirstReadingWithTrafficLight(readings).trafficLightStatus
      );
    };

    sortData(
      orderBy(data as Array<Patient>, [getTrafficLightIndex], [sortOrder])
    );
    setSorted(true);
  };

  return (
    <th className={className}>
      {label}
      <SortToggle sortOrder={sortOrder} handleClick={handleClick} />
    </th>
  );
};

import { Callback, Patient } from '@types';
import { SortOrderEnum, TrafficLightEnum } from '../../../../../../../../enums';
import {
  calculateShockIndex,
  getLatestReading,
  getLatestReadingWithReferral,
} from '../../../../../../../../shared/utils';

import React from 'react';
import { SortToggle } from '../../../../../../../../shared/components/sortToggle';
import orderBy from 'lodash/orderBy';

interface IProps {
  className: string;
  data: Array<Patient>;
  sortData: Callback<Array<Patient>>;
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
      const latestReading = getLatestReading(readings);

      return trafficLights.current.indexOf(
        getLatestReadingWithReferral(readings)?.trafficLightStatus ??
          calculateShockIndex(latestReading)
      );
    };

    sortData(orderBy(data, [getTrafficLightIndex], [sortOrder]));
    setSorted(true);
  };

  return (
    <th className={className}>
      {label}
      <SortToggle sortOrder={sortOrder} handleClick={handleClick} />
    </th>
  );
};

import { Callback, GlobalSearchPatient, Patient } from '@types';

import React from 'react';
import { SortOrderEnum } from '../../../../../../../../enums';
import { SortToggle } from '../../../../../../../../shared/components/sortToggle';
import orderBy from 'lodash/orderBy';

interface IProps {
  className: string;
  data: Array<Patient> | Array<GlobalSearchPatient>;
  sortData: Callback<Array<Patient> | Array<GlobalSearchPatient>>;
  label?: string;
}

export const PatientIdHead: React.FC<IProps> = ({
  className,
  data,
  label,
  sortData,
}) => {
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
    sortData(orderBy(data as Array<Patient>, [`patientId`], [sortOrder]));
    setSorted(true);
  };

  return (
    <th className={className}>
      {label}
      <SortToggle sortOrder={sortOrder} handleClick={handleClick} />
    </th>
  );
};

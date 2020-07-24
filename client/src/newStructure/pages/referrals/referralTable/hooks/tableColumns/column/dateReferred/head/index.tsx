import { Callback, OrUndefined, Patient } from '@types';

import React from 'react';
import { SortOrderEnum } from '../../../../../../../../enums';
import { SortToggle } from '../../../../../../../../shared/components/sortToggle';
import orderBy from 'lodash/orderBy';

interface IProps {
  className: string;
  data: Array<Patient>;
  sortData: Callback<Array<Patient>>;
  label?: string;
}

export const DateReferredHead: React.FC<IProps> = ({
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
    const getLastDateReferred = ({
      readings,
    }: Patient): OrUndefined<number> => {
      return orderBy(readings, [`dateReferred`], [`desc`])[0].dateReferred;
    };

    sortData(orderBy(data, [getLastDateReferred], [sortOrder]));
    setSorted(true);
  };

  return (
    <th className={className}>
      {label}
      <SortToggle sortOrder={sortOrder} handleClick={handleClick} />
    </th>
  );
};

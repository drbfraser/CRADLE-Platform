import { Callback, User } from 'src/types';

import React from 'react';
import { SortOrderEnum } from 'src/enums';
import { SortToggle } from 'src/shared/components/sortToggle';
import orderBy from 'lodash/orderBy';

interface IProps {
  className: string;
  data: Array<User>;
  sortData: Callback<Array<User>>;
  label?: string;
}

export const FirstNameHead: React.FC<IProps> = ({
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
    sortData(orderBy(data, [`firstName`], [sortOrder]));
    setSorted(true);
  };

  return (
    <th className={className}>
      {label}
      <SortToggle sortOrder={sortOrder} handleClick={handleClick} />
    </th>
  );
};

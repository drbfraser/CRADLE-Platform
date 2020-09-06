import { Callback, OrNull, OrUndefined, User } from '@types';

import React from 'react';
import { useFilterBySearchText } from './filterBySearchText';

interface IArgs {
  data: OrNull<Array<User>>;
  searchText: OrUndefined<string>;
  sortUsers: Callback<OrNull<Array<User>>>;
}

interface IUseData {
  users: Array<User>;
  sortData: Callback<Array<User>>;
}

export const useData = ({ data, searchText, sortUsers }: IArgs): IUseData => {
  const filterBySearchText = useFilterBySearchText({
    searchText,
  });

  const [users, setUsers] = React.useState<Array<User>>([]);

  React.useEffect((): void => {
    if (data === null) {
      setUsers([]);
    }

    setUsers(filterBySearchText(data) as Array<User>);
  }, [data, filterBySearchText]);

  const sortData = (sortedUsers: Array<User>): void => {
    sortUsers(sortedUsers);
  };

  return { users, sortData };
};

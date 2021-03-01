import { OrNull, User } from 'src/types';
import {
  clearAllUsersRequestOutcome,
  getUsers,
  sortUsers,
  updatePageNumber,
  updateSearchText,
} from 'src/redux/reducers/user/allUsers';
import { useDispatch, useSelector } from 'react-redux';

import { AdminTable } from './adminTable';
import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { Toast } from 'src/shared/components/toast';

type SelectorState = {
  error: OrNull<string>;
  loading: boolean;
  pageNumber: number;
  success: OrNull<string>;
  users: OrNull<Array<User>>;
  searchText?: string;
};

export const AdminPage: React.FC = () => {
  const {
    error,
    success,
    loading,
    pageNumber,
    searchText,
    users,
  } = useSelector(
    ({ user }: ReduxState): SelectorState => ({
      error: user.allUsers.error ? user.allUsers.message : null,
      loading: user.allUsers.loading,
      pageNumber: user.allUsers.pageNumber,
      success: user.allUsers.success,
      searchText: user.allUsers.searchText,
      users: user.allUsers.data,
    })
  );

  const dispatch = useDispatch();

  React.useEffect((): void => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleSortUsers = (sortedUsers: OrNull<Array<User>>): void => {
    dispatch(sortUsers(sortedUsers));
  };

  const handlePageNumberChange = (page: number): void => {
    dispatch(updatePageNumber(page));
  };

  const handleSearchTextChange = (text?: string): void => {
    dispatch(updateSearchText(text));
  };

  const clearMessage = (): void => {
    dispatch(clearAllUsersRequestOutcome());
  };

  return (
    <>
      <Toast
        message={error ?? success}
        clearMessage={clearMessage}
        status={error ? `error` : `success`}
      />
      <AdminTable
        data={users}
        pageNumber={pageNumber}
        loading={loading}
        sortUsers={handleSortUsers}
        updatePageNumber={handlePageNumberChange}
        updateSearchText={handleSearchTextChange}
        searchText={searchText}
      />
    </>
  );
};

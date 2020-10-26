import { Callback, OrUndefined } from '@types';

import React from 'react';
import TextField from '@material-ui/core/TextField';
import { useSearchFocus } from './hooks/focus';

interface IProps {
  updateSearchText: Callback<OrUndefined<string>>;
  globalSearch?: boolean;
  placeholder?: string;
  searchText?: string;
}

export const DefaultSearch: React.FC<IProps> = ({
  updateSearchText,
  globalSearch,
  placeholder = 'Patient ID or Name',
  searchText,
}) => {
  const search = useSearchFocus(globalSearch ?? false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateSearchText(event.target.value);
  };

  return (
    <TextField
      inputRef={search}
      label="Search filter"
      placeholder={placeholder}
      variant="outlined"
      value={searchText}
      onChange={handleChange}
    />
  );
};

import { Callback, OrUndefined } from '@types';

import React from 'react';
import TextField from '@material-ui/core/TextField';
import { useSearchFocus } from './hooks/focus';

interface IProps {
  globalSearch?: boolean;
  updateSearchText: Callback<OrUndefined<string>>;
  searchText?: string;
}

export const DefaultSearch: React.FC<IProps> = ({
  globalSearch,
  searchText,
  updateSearchText,
}) => {
  const search = useSearchFocus(globalSearch ?? false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateSearchText(event.target.value);
  };

  return (
    <TextField
      inputRef={search}
      label="Search filter"
      placeholder="Patient ID or Initals"
      variant="outlined"
      value={searchText}
      onChange={handleChange}
    />
  );
};

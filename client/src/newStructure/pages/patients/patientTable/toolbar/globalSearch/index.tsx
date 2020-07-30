import Autocomplete, {
  AutocompleteRenderInputParams,
} from '@material-ui/lab/Autocomplete';

import React from 'react';
import { TextField } from '@material-ui/core';
import { toggleGlobalSearch } from '../../../../../redux/reducers/patients';
import { useDispatch } from 'react-redux';
import { useStyles } from './styles';

enum SearchFilterEnum {
  LOCAL_SEARCH = 'My health facility',
  GLOBAL_SEARCH = 'All health facilities',
}

interface IProps {
  className: string;
  globalSearch?: boolean;
}

export const GlobalSearch: React.FC<IProps> = ({ className, globalSearch }) => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const handleChange = (value: string): void => {
    dispatch(toggleGlobalSearch(value === SearchFilterEnum.GLOBAL_SEARCH));
  };

  return (
    <Autocomplete
      autoComplete={true}
      autoHighlight={true}
      className={className}
      classes={{ root: classes.dropdown }}
      value={
        globalSearch
          ? SearchFilterEnum.GLOBAL_SEARCH
          : SearchFilterEnum.LOCAL_SEARCH
      }
      disableClearable={true}
      getOptionLabel={(option: string): string => option}
      getOptionSelected={(option: string, selected: string): boolean =>
        option === selected
      }
      options={Object.values(SearchFilterEnum)}
      renderInput={(params: AutocompleteRenderInputParams): JSX.Element => (
        <TextField {...params} label="Search region" variant="outlined" />
      )}
      onChange={(_: any, value: string): void => {
        handleChange(value);
      }}
    />
  );
};

import { ActionEnum, SearchFilterEnum } from '../hooks/actions';
import Autocomplete, { AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';

import React from 'react';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { useStyles } from './styles';

interface IProps {
  action: ActionEnum;
  showReferredPatients: boolean;
  toggleGlobalSearch: React.Dispatch<React.SetStateAction<boolean>>;
  toggleShowReferredPatients: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch?: boolean;
}

export const Action: React.FC<IProps> = ({ 
  action, 
  showReferredPatients, 
  toggleGlobalSearch,
  toggleShowReferredPatients,
  globalSearch,
}) => {
  const classes = useStyles();

  const handleClick = (): void => 
    toggleShowReferredPatients((showing: boolean): boolean => !showing);
  
  if (action === ActionEnum.TOGGLE_REFERRED) {
    return (
      <Tooltip 
        title={showReferredPatients ? `Show all patients` : `Show referred patients`}
      >
        <Switch
          color="primary"
          checked={ showReferredPatients }
          onClick={handleClick}
        />
      </Tooltip>
    );
  }

  if (action === ActionEnum.GLOBAL_SEARCH) {
    return (
      <Autocomplete
        autoComplete={true}
        autoHighlight={true}
        classes={{ root: classes.dropdown }}
        value={globalSearch ? SearchFilterEnum.GLOBAL_SEARCH : SearchFilterEnum.LOCAL_SEARCH}
        disableClearable={true}
        getOptionLabel={(option: string): string => option}
        getOptionSelected={(option: string, selected: string): boolean => option === selected}
        options={Object.values(SearchFilterEnum)}
        renderInput={(params: AutocompleteRenderInputParams): JSX.Element => <TextField {...params} label="Search filter" variant="outlined" />}
        onChange={(_: any, value: string): void => {
          toggleGlobalSearch(value === SearchFilterEnum.GLOBAL_SEARCH);
        }}
      />
    );
  }

  return null;
};

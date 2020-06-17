import Autocomplete, { AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';

import { Action } from 'material-table';
import { Callback } from '@types';
import { Patient } from '@types';
import React from 'react';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import { useStyles } from './styles';

export enum ActionEnum {
  GLOBAL_SEARCH,
  TOGGLE_REFERRED,
}

enum SearchFilterEnum {
  LOCAL_SEARCH = 'Local search',
  GLOBAL_SEARCH = 'Global search',
}

interface IArgs {
  showReferredPatients: boolean;
  toggleGlobalSearch: React.Dispatch<React.SetStateAction<boolean>>;
  toggleShowReferredPatients: Callback<Callback<boolean, boolean>>;
  showGlobalSearchAction?: boolean;
};

export const useActions = ({ 
  showReferredPatients, 
  toggleGlobalSearch,
  toggleShowReferredPatients,
  showGlobalSearchAction, 
}: IArgs): Array<Action<Patient>> => {
  const classes = useStyles();
  const toggleReferredPatientsAction = React.useMemo<Action<Patient>>(() => ({
    icon: (): React.ReactElement => (
      <Switch
        color="primary"
        checked={ showReferredPatients }
      />
    ),
    tooltip: showReferredPatients ? `Show all patients` : `Show referred patients`,
    isFreeAction: true,
    onClick: (): void => {
      toggleShowReferredPatients((showing: boolean): boolean => !showing);
    }
  }), [showReferredPatients, toggleShowReferredPatients]);

  const globalSearchAction =  {
    icon: (): React.ReactElement => (
      <Autocomplete
        autoComplete={true}
        autoHighlight={true}
        classes={{ root: classes.dropdown }}
        defaultValue={Object.values(SearchFilterEnum)[0]}
        disableClearable={true}
        getOptionLabel={(option: string): string => option}
        getOptionSelected={(option: string, selected: string): boolean => option === selected}
        options={Object.values(SearchFilterEnum)}
        renderInput={(params: AutocompleteRenderInputParams): JSX.Element => <TextField {...params} label="Search filter" variant="outlined" />}
        onChange={(_: any, value: string): void => {
          toggleGlobalSearch(value === SearchFilterEnum.GLOBAL_SEARCH);
        }}
      />
    ),
    isFreeAction: true,
  } as Action<Patient>;

  return React.useMemo<Array<Action<Patient>>>((): Array<Action<Patient>> => {
    const actionsMap = new Map<ActionEnum, Action<Patient>>();
    
    if (showGlobalSearchAction) {
      actionsMap.set(ActionEnum.GLOBAL_SEARCH, globalSearchAction);
    }

    actionsMap.set(ActionEnum.TOGGLE_REFERRED, toggleReferredPatientsAction);
    
    return Array.from(actionsMap.values());
  }, [showGlobalSearchAction]);
};
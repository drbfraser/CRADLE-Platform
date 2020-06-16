import Autocomplete, { AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';

import { Action } from 'material-table';
import { Callback } from '@types';
import { Patient } from '@types';
import React from 'react';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import { useStyles } from './styles';

enum SearchFilterEnum {
  LOCAL_SEARCH = 'Local search',
  GLOBAL_SEARCH = 'Global search',
}

interface IArgs {
  showReferredPatients: boolean;
  toggleGlobalSearch: React.Dispatch<React.SetStateAction<boolean>>;
  toggleShowReferredPatients: Callback<Callback<boolean, boolean>>;
  usingGlobalSearch: boolean;
  showGlobalSearchAction?: boolean;
};

interface IUseActions {
  actions: Array<Action<Patient>>;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useActions = ({ 
  showReferredPatients, 
  toggleGlobalSearch,
  toggleShowReferredPatients,
  usingGlobalSearch,
  showGlobalSearchAction, 
}: IArgs): IUseActions => {
  const classes = useStyles();
  const [, setSearching] = React.useState<boolean>(false);

  React.useEffect((): void => {
    if (!usingGlobalSearch) {
      setSearching(false);
    }
  }, [usingGlobalSearch]);

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

  return {
    actions: React.useMemo((): any => {
      const actions: Array<Action<Patient>> = [toggleReferredPatientsAction];

      if (showGlobalSearchAction) {
        actions.push(globalSearchAction);
      }

      return actions;
      }, [
          showGlobalSearchAction, 
          toggleReferredPatientsAction, 
        ]
    ), 
    setSearching,
  };
};
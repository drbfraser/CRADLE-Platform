import { Action } from 'material-table';
import { Callback } from '@types';
import { Patient } from '@types';
import React from 'react';
import Switch from '@material-ui/core/Switch';

interface IArgs {
  showReferredPatients: boolean;
  addPatientToHealthFacility: Callback<Patient>;
  toggleGlobalSearch: Callback<Callback<boolean, boolean>>;
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
  addPatientToHealthFacility,
  toggleGlobalSearch,
  toggleShowReferredPatients,
  usingGlobalSearch,
  showGlobalSearchAction, 
}: IArgs): IUseActions => {
  const [searching, setSearching] = React.useState<boolean>(false);

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
    icon: `public`,
    iconProps: { color: usingGlobalSearch ? `primary` : `inherit` },
    tooltip: usingGlobalSearch ? `Use default search` : `Use global search`,
    isFreeAction: true,
    onClick: (): void => toggleGlobalSearch(
      (global: boolean): boolean => !global
    ),
  } as Action<Patient>;

  const addPatientAction = {
    icon: 'add',
    onClick: (_: any, patient: Patient): void => {
      addPatientToHealthFacility(patient);
    },
  } as Action<Patient>;
  
  return {
    actions: React.useMemo((): any => {
      const actions: Array<Action<Patient>> = [toggleReferredPatientsAction];

      if (showGlobalSearchAction) {
        actions.push(globalSearchAction);
      }

      if (searching) {
        actions.push(addPatientAction);
      }
    
      return actions;
      }, [
          addPatientAction,
          searching,
          showGlobalSearchAction, 
          toggleReferredPatientsAction, 
        ]
    ), 
    setSearching,
  };
};
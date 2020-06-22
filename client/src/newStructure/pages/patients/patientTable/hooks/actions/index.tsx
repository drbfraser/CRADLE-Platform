import { GlobalSearchPatient, Patient } from '@types';

import { Action } from 'material-table';
import React from 'react';

export enum ActionEnum {
  GLOBAL_SEARCH = 'Global search',
  TOGGLE_REFERRED = 'Toggle referred',
  ADD_GLOBAL_SEARCH_PATIENT = 'Add global search patient',
}

export enum SearchFilterEnum {
  LOCAL_SEARCH = 'Local search',
  GLOBAL_SEARCH = 'Global search',
}

interface IArgs {
  globalSearch: boolean;
  patientsExist: boolean;
  showGlobalSearch?: boolean;
};

export const useActions = ({ 
  globalSearch,
  patientsExist,
  showGlobalSearch, 
}: IArgs): Array<Action<Patient| GlobalSearchPatient>> => {
  const toggleReferredPatientsAction = {
    icon: ActionEnum.TOGGLE_REFERRED,
    isFreeAction: true,
    onClick: (): void => { return; }
  };
  
  const globalSearchAction =  {
    icon: ActionEnum.GLOBAL_SEARCH,
    isFreeAction: true,
    onClick: (): void => { return; }
  } as Action<Patient>;

  const addGlobalSearchPatient =  {
    icon: ActionEnum.ADD_GLOBAL_SEARCH_PATIENT,
    onClick: (): void => { return; }
  } as Action<GlobalSearchPatient>;

  return React.useMemo<Array<Action<Patient | GlobalSearchPatient>>>((): Array<Action<Patient | GlobalSearchPatient>> => {
    const actions = [];
    
    if (showGlobalSearch) {
      actions.push(globalSearchAction);
    }
    
    if (globalSearch && patientsExist) {
      actions.push(addGlobalSearchPatient);
    }

    actions.push(toggleReferredPatientsAction);
    
    return actions;
  }, [
      addGlobalSearchPatient, 
      globalSearch, 
      globalSearchAction, 
      patientsExist,
      showGlobalSearch, 
      toggleReferredPatientsAction
    ]);
};
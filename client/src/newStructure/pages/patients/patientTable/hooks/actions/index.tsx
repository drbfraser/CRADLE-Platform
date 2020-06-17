import { Action } from 'material-table';
import { Patient } from '@types';
import React from 'react';

export enum ActionEnum {
  GLOBAL_SEARCH = 'Global search',
  TOGGLE_REFERRED = 'Toggle referred',
}

export enum SearchFilterEnum {
  LOCAL_SEARCH = 'Local search',
  GLOBAL_SEARCH = 'Global search',
}

interface IArgs {
  showGlobalSearch?: boolean;
};

export const useActions = ({ 
  showGlobalSearch, 
}: IArgs): Array<Action<Patient>> => {
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

  return React.useMemo<Array<Action<Patient>>>((): Array<Action<Patient>> => {
    const actions = [];
    
    if (showGlobalSearch) {
      actions.push(globalSearchAction);
    }

    actions.push(toggleReferredPatientsAction);
    
    return actions;
  }, [showGlobalSearch]);
};
import { Callback } from '@types';
import React from 'react';
import Switch from '@material-ui/core/Switch';

interface IArgs {
  showReferredPatients: boolean;
  toggleGlobalSearch: Callback<Callback<boolean, boolean>>;
  toggleShowReferredPatients: Callback<Callback<boolean, boolean>>;
  usingGlobalSearch: boolean;
  showGlobalSearchAction?: boolean;
};

export const useActions = ({ 
  showReferredPatients, 
  toggleGlobalSearch,
  toggleShowReferredPatients,
  usingGlobalSearch,
  showGlobalSearchAction, 
}: IArgs): any => {
  const showReferredPatientsAction = React.useMemo(() => ({
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
  
  return React.useMemo((): any => showGlobalSearchAction 
    ? [
        {...showReferredPatientsAction}, 
        {
          icon: `public`,
          iconProps: { color: usingGlobalSearch ? `primary` : `inherit` },
          tooltip: usingGlobalSearch ? `Default search` : `Use global search`,
          isFreeAction: true,
          onClick: () => {
            toggleGlobalSearch((global: boolean): boolean => !global);
          }
        }
      ]
    : [{...showReferredPatientsAction}] 
    , [
        showGlobalSearchAction, 
        showReferredPatientsAction, 
        toggleGlobalSearch, 
        usingGlobalSearch,
      ]
  );
};
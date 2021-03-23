import { ITakeActionContext, TakeActionContext } from '..';

import React from 'react';

export const useTakeActionsContext = (): ITakeActionContext => {
  const { healthFacilityOptions, vhtOptions } = React.useContext(
    TakeActionContext
  );

  if (healthFacilityOptions === undefined || vhtOptions === undefined) {
    throw new Error(`TakeActionsContext is not defined!`);
  }

  return {
    healthFacilityOptions,
    vhtOptions,
  };
};

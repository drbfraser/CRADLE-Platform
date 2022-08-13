import { DimensionsContext, IDimensionsContext } from '..';

import React from 'react';

export const useDimensionsContext = (): IDimensionsContext => {
  const { drawerWidth, offsetFromTop, isBigScreen } =
    React.useContext(DimensionsContext);

  if (
    drawerWidth === undefined ||
    offsetFromTop === undefined ||
    isBigScreen === undefined
  ) {
    throw new Error(`DimensionsContext is not defined!`);
  }

  return {
    drawerWidth,
    offsetFromTop,
    isBigScreen,
  };
};

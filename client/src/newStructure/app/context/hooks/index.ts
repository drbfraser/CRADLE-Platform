import { DimensionsContext, IDimensionsContext } from '..';

import React from 'react';

export const useDimensionsContext = (): IDimensionsContext => {
  const { drawerWidth, offsetFromTop } = React.useContext(DimensionsContext);

  if (drawerWidth === undefined || offsetFromTop === undefined) {
    throw new Error(`DimensionsContext is not defined!`);
  }

  return {
    drawerWidth,
    offsetFromTop,
  };
};

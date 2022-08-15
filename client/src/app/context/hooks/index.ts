import { AppDispatch, RootState } from 'src/redux/store';
import { DimensionsContext, IDimensionsContext } from '..';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

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

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

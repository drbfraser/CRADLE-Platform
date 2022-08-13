import React from 'react';

export interface IDimensionsContext {
  drawerWidth: number;
  offsetFromTop: number;
  isBigScreen: boolean;
}

export const DimensionsContext = React.createContext<
  Partial<IDimensionsContext>
>({});

export const DimensionsContextProvider: React.FC<IDimensionsContext> = ({
  children,
  drawerWidth,
  offsetFromTop,
  isBigScreen,
}) => {
  return (
    <DimensionsContext.Provider
      value={{
        drawerWidth,
        offsetFromTop,
        isBigScreen,
      }}>
      {children}
    </DimensionsContext.Provider>
  );
};

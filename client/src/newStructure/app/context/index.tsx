import React from 'react';

export interface IDimensionsContext {
  drawerWidth: number;
  offsetFromTop: number;
}

export const DimensionsContext = React.createContext<
  Partial<IDimensionsContext>
>({});

interface IProps {
  drawerWidth: number;
  offsetFromTop: number;
}

export const DimensionsContextProvider: React.FC<IProps> = ({
  children,
  drawerWidth,
  offsetFromTop,
}) => {
  return (
    <DimensionsContext.Provider
      value={{
        drawerWidth,
        offsetFromTop,
      }}>
      {children}
    </DimensionsContext.Provider>
  );
};

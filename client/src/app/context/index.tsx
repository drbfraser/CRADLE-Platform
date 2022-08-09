import React from 'react';

export interface IDimensionsContext {
  drawerWidth: number;
  offsetFromTop: number;
}

export const DimensionsContext = React.createContext<
  Partial<IDimensionsContext>
>({});

interface IProps {
  children: React.ReactNode;
  drawerWidth: number;
  offsetFromTop: number;
  children: React.ReactNode;
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

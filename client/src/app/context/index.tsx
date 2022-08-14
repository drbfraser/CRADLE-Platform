import React from 'react';

export interface IDimensionsContext {
  drawerWidth: number;
  offsetFromTop: number;
  isBigScreen: boolean;
}

export const DimensionsContext = React.createContext<
  Partial<IDimensionsContext>
>({});
interface IProps extends IDimensionsContext {
  children: React.ReactNode;
}

export const DimensionsContextProvider: React.FC<IProps> = ({
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

import { MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { theme } from './theme';

interface IProps {
  children: React.ReactNode;
}

export const MaterialUIContextProvider: React.FC<IProps> = ({ children }) => {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

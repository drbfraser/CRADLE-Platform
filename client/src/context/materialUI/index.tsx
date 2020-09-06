import { MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { theme } from './theme';

export const MaterialUIContextProvider: React.FC = ({ children }) => {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

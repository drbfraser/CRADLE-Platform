import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import React from 'react';
import { theme } from './theme';

interface IProps {
  children: React.ReactNode;
}

export const MaterialUIContextProvider: React.FC<IProps> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};

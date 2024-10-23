import { PropsWithChildren } from 'react';

import { Provider as ReduxProvider } from 'react-redux';
import { reduxStore } from 'src/redux/store';
import { Router } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { MaterialUIContextProvider } from 'src/context/providers/materialUI';
import { AppProvider } from '@toolpad/core/AppProvider'; // MUI Toolpad.

import { theme } from 'src/context/providers/materialUI/theme';
import { history } from 'src/shared/history';

/** Combined Context Providers to wrap the top level App component. */

export const TopLevelContextProviders = ({ children }: PropsWithChildren) => {
  return (
    <Router history={history}>
      <ReduxProvider store={reduxStore}>
        <MaterialUIContextProvider>
          <AppProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              {children}
            </LocalizationProvider>
          </AppProvider>
        </MaterialUIContextProvider>
      </ReduxProvider>
    </Router>
  );
};

import { PropsWithChildren } from 'react';

import { Provider as ReduxProvider } from 'react-redux';
import { reduxStore } from 'src/redux/store';
import { Router } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { MaterialUIContextProvider } from 'src/app/providers/materialUI';
import { AppProvider } from '@toolpad/core/AppProvider';

import { theme } from 'src/app/providers/materialUI/theme';
import { history } from '../../redux/reducers/history';

/** Combined Context Providers to wrap the top level App component. */

export const TopLevelContextProviders = ({ children }: PropsWithChildren) => {
  return (
    <ReduxProvider store={reduxStore}>
      <Router history={history}>
        <MaterialUIContextProvider>
          <AppProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              {children}
            </LocalizationProvider>
          </AppProvider>
        </MaterialUIContextProvider>
      </Router>
    </ReduxProvider>
  );
};

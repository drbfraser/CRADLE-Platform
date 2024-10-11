import { PropsWithChildren } from 'react';

import { Provider as ReduxProvider } from 'react-redux';
import { reduxStore } from 'src/redux/store';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { MaterialUIContextProvider } from 'src/app/providers/materialUI';

/** Combined Context Providers to wrap the top level App component. */

export const TopLevelContextProviders = ({ children }: PropsWithChildren) => {
  return (
    <ReduxProvider store={reduxStore}>
      <BrowserRouter>
        <MaterialUIContextProvider>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            {children}
          </LocalizationProvider>
        </MaterialUIContextProvider>
      </BrowserRouter>
    </ReduxProvider>
  );
};

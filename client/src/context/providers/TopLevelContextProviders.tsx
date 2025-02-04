import { PropsWithChildren } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { reduxStore } from 'src/redux/store';
import { MaterialUIContextProvider } from 'src/context/providers/materialUI';
import { MuiToolpadProvider } from './materialUI/MuiToolpadProvider';

const queryClient = new QueryClient();

/** Combined Context Providers to wrap the top level App component. */
export const TopLevelContextProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ReduxProvider store={reduxStore}>
          <MaterialUIContextProvider>
            <MuiToolpadProvider>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                {children}
              </LocalizationProvider>
            </MuiToolpadProvider>
          </MaterialUIContextProvider>
        </ReduxProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

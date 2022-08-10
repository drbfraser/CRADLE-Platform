import 'sanitize.css/sanitize.css';
import './index.css';

import {
  StyledEngineProvider,
  Theme,
  ThemeProvider,
  createTheme,
} from '@mui/material/styles';

import { App } from './app';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { history } from './redux/reducers';
import { reduxStore } from './redux/store';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const theme = createTheme();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <ReduxProvider store={reduxStore}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </ReduxProvider>
    </ThemeProvider>
  </StyledEngineProvider>
);

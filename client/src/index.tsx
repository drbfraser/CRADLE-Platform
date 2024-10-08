import 'sanitize.css/sanitize.css';
import './index.css';

import { App } from './app';
import { ContextProvider } from './context';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { reduxStore } from './redux/store';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ReduxProvider store={reduxStore}>
    <BrowserRouter>
      <ContextProvider>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <App />
        </LocalizationProvider>
      </ContextProvider>
    </BrowserRouter>
  </ReduxProvider>
);

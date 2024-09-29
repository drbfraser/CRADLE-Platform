import 'sanitize.css/sanitize.css';
import './index.css';

import { App } from './app';
import { ConnectedRouter } from 'connected-react-router';
import { ContextProvider } from './context';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { history } from './redux/reducers';
import { reduxStore } from './redux/store';
import { CompatRouter } from 'react-router-dom-v5-compat';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ReduxProvider store={reduxStore}>
    <ConnectedRouter history={history}>
      <CompatRouter>
        <ContextProvider>
          <App />
        </ContextProvider>
      </CompatRouter>
    </ConnectedRouter>
  </ReduxProvider>
);

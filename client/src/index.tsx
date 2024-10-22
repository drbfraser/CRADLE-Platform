import 'sanitize.css/sanitize.css';
import './index.css';

import { App } from './app';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<App />);

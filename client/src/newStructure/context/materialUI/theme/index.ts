import { createMuiTheme } from '@material-ui/core/styles';
import cyan from '@material-ui/core/colors/cyan';
import indigo from '@material-ui/core/colors/indigo';
import { overrides } from './overrides';

export const theme = createMuiTheme({
  overrides,
  palette: {
    primary: {
      main: indigo[500],
    },
    secondary: {
      main: cyan[500],
    },
  },
});

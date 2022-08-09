import { createTheme, adaptV4Theme } from '@mui/material/styles';
import { overrides } from './overrides';

import { cyan, indigo } from '@mui/material/colors';

export const theme = createTheme(adaptV4Theme({
  overrides,
  palette: {
    primary: {
      main: indigo[500],
    },
    secondary: {
      main: cyan[500],
    },
  },
}));

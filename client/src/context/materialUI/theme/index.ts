import { adaptV4Theme, createTheme } from '@mui/material/styles';
import { cyan, indigo } from '@mui/material/colors';

import { overrides } from './overrides';

export const theme = createTheme(
  adaptV4Theme({
    overrides,
    palette: {
      primary: {
        main: indigo[500],
      },
      secondary: {
        main: cyan[500],
      },
    },
  })
);

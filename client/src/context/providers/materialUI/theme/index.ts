import { cyan, indigo } from '@mui/material/colors';

import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

export const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: `initial`,
        },
      },
    },
    MuiDataGrid: {},
  },
  palette: {
    primary: {
      main: indigo[500],
    },
    secondary: {
      main: cyan[500],
    },
  },
  colorSchemes: {
    light: true,
  },
});

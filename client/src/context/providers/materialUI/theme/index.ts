import { cyan, indigo } from '@mui/material/colors';

import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

export const theme = createTheme({
  colorSchemes: { light: true, dark: false },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: `initial`,
        },
      },
    },
    MuiDataGrid: {},
    MuiPaper: {
      defaultProps: {
        elevation: 5,
      },
    },
  },
  palette: {
    primary: {
      main: indigo[500],
    },
    secondary: {
      main: cyan[500],
    },
  },
});

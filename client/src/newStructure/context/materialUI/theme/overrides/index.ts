//@ts-nocheck

import { Overrides } from '@material-ui/core/styles/overrides';

export const overrides: Overrides = {
  MUIDataTable: {
    responsiveBase: {
      minHeight: `67vh`,
      maxHeight: `67vh`,
    },
  },
  MUIDataTableToolbar: {
    root: {
      padding: `12px 24px`,
    },
    actions: {
      display: `flex`,
      flexGrow: 0,
      flexWrap: `wrap`,
      justifyContent: `flex-end`,
      alignItems: `center`,
      [`& span`]: {
        [`& button`]: {
          marginBlockStart: `8px`,
        },
      },
    },
  },
  MUIDataTableSearch: {
    clearIcon: {
      display: `none`,
    },
    searchIcon: {
      display: `none`,
    },
  },
};

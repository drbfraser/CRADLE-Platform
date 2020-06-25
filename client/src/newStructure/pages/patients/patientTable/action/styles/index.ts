import { green, grey } from '@material-ui/core/colors';

import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
  dropdown: {
    marginBlockStart: `1rem`,
    width: 200,
  },
  toggle: {
    marginBlockStart: `1rem`,
  },
  justAdded: {
    color: grey[100],
    backgroundColor: green[500],
    [`&:hover`]: {
      backgroundColor: green[600],
    },
    [`&:focus`]: {
      backgroundColor: green[600],
    },
  },
});

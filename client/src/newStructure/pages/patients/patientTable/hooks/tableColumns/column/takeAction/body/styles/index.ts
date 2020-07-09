import { green, grey } from '@material-ui/core/colors';

import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
  button: {
    cursor: `pointer`,
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

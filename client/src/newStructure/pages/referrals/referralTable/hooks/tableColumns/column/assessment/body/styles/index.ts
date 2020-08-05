import { Theme, makeStyles } from '@material-ui/core/styles';

import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: `flex`,
    alignItems: `center`,
    justifyContent: `center`,
    marginInlineStart: `${theme.spacing(-1)}px`,
    [`& > :first-child`]: {
      marginInlineEnd: `${theme.spacing(0.5)}px`,
    },
  },
  pending: {
    color: red[500],
  },
  complete: {
    color: green[500],
  },
}));

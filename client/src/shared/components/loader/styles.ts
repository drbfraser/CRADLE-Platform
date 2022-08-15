import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBlockStart: theme.spacing(2),
    width: `100%`,
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
    justifyContent: `center`,
    [`& > p`]: {
      marginBlockStart: theme.spacing(2),
    },
  },
}));

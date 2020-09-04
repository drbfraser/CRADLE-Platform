import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBlockStart: `${theme.spacing(2)}px`,
    width: `100%`,
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
    justifyContent: `center`,
    [`& > p`]: {
      marginBlockStart: `${theme.spacing(2)}px`,
    },
  },
}));

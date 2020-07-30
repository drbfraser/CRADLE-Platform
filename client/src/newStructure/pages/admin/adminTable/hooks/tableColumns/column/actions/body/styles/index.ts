import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: `flex`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  icon: {
    color: theme.palette.text.primary,
  },
}));

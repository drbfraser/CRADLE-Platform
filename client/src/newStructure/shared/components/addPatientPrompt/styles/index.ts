import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  button: {
    textTransform: `initial`,
  },
  actions: {
    padding: theme.spacing(2),
  },
}));

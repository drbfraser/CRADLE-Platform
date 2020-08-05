import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    margin: theme.spacing(2, 2.5, 0, 0),
  },
}));

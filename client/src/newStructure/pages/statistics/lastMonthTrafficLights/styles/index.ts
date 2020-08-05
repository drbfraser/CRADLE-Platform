import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  header: {
    marginBlockEnd: `${theme.spacing(2)}px`,
  },
}));

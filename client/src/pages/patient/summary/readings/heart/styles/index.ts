import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  heart: {
    marginBlockStart: `${theme.spacing(3)}px`,
  },
}));

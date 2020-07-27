import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  submit: {
    marginBlockStart: `${theme.spacing(2)}px`,
  },
}));

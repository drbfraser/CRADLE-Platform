import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    borderLeft: `2px solid #84ced4`,
    paddingInlineStart: `${theme.spacing(2)}px`,
  },
  comment: {
    marginBlockStart: `${theme.spacing(1.5)}px`,
  },
}));

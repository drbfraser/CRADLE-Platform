import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(0, 1),
    [`& > label`]: {
      display: `block`,
      margin: `0 0 .28571429rem ${theme.spacing(-1)}px`,
      color: `rgba(0,0,0,.87)`,
      fontSize: `.92857143em`,
      fontWeight: 700,
    },
  },
}));

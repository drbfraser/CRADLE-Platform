import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBlockEnd: `${theme.spacing(2)}px`,
    [`& > p`]: {
      marginBlockEnd: `${theme.spacing(0.5)}px`,
    },
  },
}));

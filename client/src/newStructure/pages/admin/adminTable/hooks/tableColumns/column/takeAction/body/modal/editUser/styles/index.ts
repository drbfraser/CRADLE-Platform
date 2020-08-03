import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  content: {
    display: `flex`,
    flexDirection: `column`,
    [`& > *`]: {
      marginBlockEnd: `${theme.spacing(2)}px`,
    },
  },
  actions: {
    padding: theme.spacing(2),
  },
}));

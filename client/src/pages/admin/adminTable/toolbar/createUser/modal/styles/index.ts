import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: theme.spacing(0, `auto`),
    maxWidth: theme.breakpoints.values.sm,
  },
  cardContent: {
    display: `flex`,
    flexDirection: `column`,
    [`& > *`]: {
      marginBlockEnd: `${theme.spacing(2)}px`,
    },
  },
  cardActions: {
    display: `flex`,
    justifyContent: `flex-end`,
    padding: theme.spacing(2),
  },
}));

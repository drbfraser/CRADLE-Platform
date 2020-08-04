import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: `flex`,
    flexDirection: `column`,
    [`& > *`]: {
      marginBlockEnd: `${theme.spacing(2)}px`,
    },
  },
  row: {
    display: `grid`,
    gridTemplateColumns: `repeat(2, 1fr)`,
    gridColumnGap: theme.spacing(),
  },
}));

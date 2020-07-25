import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(1, 0),
    display: `flex`,
    justifyContent: `space-between`,
    alignItems: `center`,
    flexWrap: `wrap`,
    [`& > :last-child`]: {
      marginInlineStart: `${theme.spacing(7)}px`,
    },
  },
}));

import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(1, 0),
    display: `flex`,
    justifyContent: `space-between`,
    flexWrap: `wrap`,
    [`& > :first-child`]: {
      alignSelf: `center`,
    },
    [`& > :last-child`]: {
      marginInlineStart: `${theme.spacing(7)}px`,
    },
  },
}));

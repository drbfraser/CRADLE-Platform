import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBlockStart: `${theme.spacing(4)}px`,
  },
  paper: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3, 3.5),
    borderRadius: 15,
    display: `flex`,
    flexDirection: `row`,
    [`& > div`]: {
      flexBasis: `50%`,
      flexGrow: 0,
    },
  },
  header: {
    display: `flex`,
    alignItems: `center`,
    [`& > :first-child`]: {
      marginInlineEnd: `${theme.spacing(0.5)}px`,
    },
  },
  reading: {
    marginBlockStart: `${theme.spacing(2)}px`,
  },
}));

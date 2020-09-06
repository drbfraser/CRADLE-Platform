import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: 500,
  },
  paper: {
    padding: theme.spacing(4, 3, 0),
    borderRadius: 15,
    height: `100%`,
  },
  title: {
    display: `flex`,
    alignItems: `center`,
    [`& > :first-child`]: {
      marginInlineEnd: `${theme.spacing(0.5)}px`,
    },
  },
  buttonGroupContainer: {
    marginBlockEnd: `${theme.spacing(2)}px`,
  },
  buttonGroup: {
    width: `100%`,
  },
  heading: {
    margin: 0,
  },
}));

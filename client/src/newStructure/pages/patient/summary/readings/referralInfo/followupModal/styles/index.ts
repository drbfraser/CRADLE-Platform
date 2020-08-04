import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: `flex`,
    flexDirection: `column`,
    [`& > *`]: {
      marginBlockEnd: `${theme.spacing(2)}px`,
    },
  },
  button: {
    backgroundColor: `#84ced4`,
    marginBlockStart: `${theme.spacing(2)}px`,
    [`&:focus`]: {
      backgroundColor: `#84ced4`,
    },
    [`&:hover`]: {
      backgroundColor: `#84ced4`,
    },
  },
  followUpNeeded: {
    display: `block`,
  },
  followUpNeededLabel: {
    cursor: `pointer`,
    fontFamily: `'IBM Plex Sans', sans-serif`,
    fontSize: `.92857143em`,
    fontWeight: 700,
  },
}));

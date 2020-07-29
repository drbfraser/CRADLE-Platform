import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
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
    fontFamily: `'IBM Plex Sans', sans-serif`,
    fontSize: `.92857143em`,
    fontWeight: 700,
  },
  followUpInstructions: {
    marginBlockStart: `${theme.spacing()}px`,
  },
  submit: {
    marginBlockStart: `${theme.spacing(2)}px`,
  },
}));

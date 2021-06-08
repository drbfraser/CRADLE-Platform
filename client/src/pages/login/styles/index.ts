import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
  imgStyle: {
    height: `100%`,
    width: `100%`,
    position: `relative`,
    left: `-25%`,
  },
  loginWrapper: {
    display: `flex`,
    flexDirection: `row`,
    justifyContent: `center`,
    height: `calc(50vh + 60px)`,
    alignItems: `center`,
    position: `relative`,
    [`& > *`]: {
      minHeight: `auto`,
    },
  },
  subWrapper: {
    width: `45%`,
    margin: `0`,
  },
  loginFormContainer: {
    position: `relative`,
  },
});

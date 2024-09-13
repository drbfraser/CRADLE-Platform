import makeStyles from '@mui/styles/makeStyles';
import { TOP_BAR_HEIGHT } from 'src/shared/constants';

export const useStyles = makeStyles({
  imgStyle: {
    width: 'auto',
    maxHeight: `calc(100vh - ${TOP_BAR_HEIGHT})`,
    objectFit: 'cover',
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

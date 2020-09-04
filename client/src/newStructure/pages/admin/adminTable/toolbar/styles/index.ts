import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
  toolbar: {
    [`& > div:nth-of-type(2)`]: {
      alignSelf: `stretch`,
      [`& > button`]: {
        height: `100%`,
      },
    },
  },
});

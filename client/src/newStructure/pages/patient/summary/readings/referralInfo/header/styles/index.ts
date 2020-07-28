import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  title: {
    display: `flex`,
    alignItems: `center`,
    [`& > :first-child`]: {
      marginInlineEnd: `${theme.spacing(0.5)}px`,
    },
  },
  subtitle: {
    marginBlockStart: `${theme.spacing(0.5)}px`,
  },
}));

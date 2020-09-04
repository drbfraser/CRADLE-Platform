import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBlockStart: `${theme.spacing(1.5)}px`,
  },
  content: {
    display: `flex`,
    flexWrap: `wrap`,
    marginBlockStart: `${theme.spacing(0.5)}px`,
    [`& > span`]: {
      marginInlineEnd: `${theme.spacing(0.5)}px`,
    },
  },
}));

import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  offsetTrafficLight: {
    marginInlineStart: `${theme.spacing(4)}px`,
  },
}));

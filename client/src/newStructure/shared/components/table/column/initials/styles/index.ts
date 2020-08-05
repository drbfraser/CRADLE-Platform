import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  text: {
    fontSize: theme.typography.h4.fontSize,
  },
}));

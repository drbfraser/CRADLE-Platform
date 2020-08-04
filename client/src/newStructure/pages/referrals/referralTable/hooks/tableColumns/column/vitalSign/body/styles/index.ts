import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  vitalSign: {
    justifyContent: `flex-start`,
    margin: 0,
    padding: theme.spacing(0, 0, 0, 8),
    maxWidth: 195,
  },
}));

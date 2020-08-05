import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  trafficLight: {
    height: 60,
    width: 60,
  },
  trafficLightArrow: {
    fontSize: theme.spacing(8),
  },
}));

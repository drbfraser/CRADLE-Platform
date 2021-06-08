import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  trafficLight: {
    height: 30,
    width: 30,
  },
  trafficLightArrow: {
    fontSize: theme.spacing(5),
  },
}));

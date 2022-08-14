import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles((theme: Theme) => ({
  trafficLight: {
    height: 30,
    width: 30,
  },
  trafficLightArrow: {
    fontSize: theme.spacing(5),
  },
}));

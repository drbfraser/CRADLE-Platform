import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { ReactComponent as GreenTraffic } from './icons/green.svg';
import React from 'react';
import { ReactComponent as RedTraffic } from './icons/red.svg';
import { TrafficLightEnum } from '../../../enums';
import Typography from '@material-ui/core/Typography';
import { ReactComponent as YellowTraffic } from './icons/yellow.svg';
import { useStyles } from './styles';

interface IProps {
  className?: string;
  status: TrafficLightEnum;
}

export const TrafficLight: React.FC<IProps> = ({ className, status }) => {
  const classes = useStyles();

  const renderTrafficLight = React.useCallback(
    (trafficLightStatus: TrafficLightEnum): JSX.Element => {
      switch (trafficLightStatus) {
        case TrafficLightEnum.RED_DOWN: {
          return (
            <>
              <RedTraffic className={classes.trafficLight} />
              <ArrowDownwardIcon className={classes.trafficLightArrow} />
            </>
          );
        }
        case TrafficLightEnum.RED_UP: {
          return (
            <>
              <RedTraffic className={classes.trafficLight} />
              <ArrowUpwardIcon className={classes.trafficLightArrow} />
            </>
          );
        }
        case TrafficLightEnum.YELLOW_UP: {
          return (
            <>
              <YellowTraffic className={classes.trafficLight} />
              <ArrowUpwardIcon className={classes.trafficLightArrow} />
            </>
          );
        }
        case TrafficLightEnum.YELLOW_DOWN: {
          return (
            <>
              <YellowTraffic className={classes.trafficLight} />
              <ArrowDownwardIcon className={classes.trafficLightArrow} />
            </>
          );
        }
        case TrafficLightEnum.GREEN: {
          return <GreenTraffic className={classes.trafficLight} />;
        }
        default: {
          return <Typography variant="h5">N/A</Typography>;
        }
      }
    },
    [classes.trafficLight, classes.trafficLightArrow]
  );

  return <div className={className ?? ``}>{renderTrafficLight(status)}</div>;
};

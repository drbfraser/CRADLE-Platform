import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { ReactComponent as GreenTraffic } from './icons/green.svg';
import { ReactComponent as NoneIcon } from './icons/none.svg';
import { ReactComponent as RedTraffic } from './icons/red.svg';
import { TrafficLightEnum } from 'src/shared/enums';
import Typography from '@mui/material/Typography';
import { ReactComponent as YellowTraffic } from './icons/yellow.svg';
import { useCallback } from 'react';
import { useStyles } from './styles';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  status: TrafficLightEnum;
}

export const TrafficLight: React.FC<IProps> = ({ status, ...props }) => {
  const classes = useStyles();

  const renderTrafficLight = useCallback(
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
          return (
            <>
              <GreenTraffic className={classes.trafficLight} />
              <ArrowDownwardIcon
                className={classes.trafficLightArrow}
                style={{ visibility: 'hidden' }}
              />
            </>
          );
        }
        case TrafficLightEnum.NONE: {
          return (
            <>
              <NoneIcon className={classes.trafficLight} />
              <ArrowDownwardIcon
                className={classes.trafficLightArrow}
                style={{ visibility: 'hidden' }}
              />
            </>
          );
        }
        default: {
          return (
            <Typography
              variant="h5"
              style={{ height: '60px', lineHeight: '60px' }}>
              N/A
            </Typography>
          );
        }
      }
    },
    [classes.trafficLight, classes.trafficLightArrow]
  );

  return <div {...props}>{renderTrafficLight(status)}</div>;
};

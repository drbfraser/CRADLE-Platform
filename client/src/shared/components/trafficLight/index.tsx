import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import GreenTraffic from './icons/green.svg?react';
import RedTraffic from './icons/red.svg?react';
import YellowTraffic from './icons/yellow.svg?react';
import NoneIcon from './icons/none.svg?react';
import { TrafficLightEnum } from 'src/shared/enums';
import Typography from '@mui/material/Typography';
import { useCallback } from 'react';
import { SxProps, Theme } from '@mui/material';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  status: TrafficLightEnum;
}

const TRAFFIC_LIGHT_PROPS = {
  height: '30px',
  width: '30px',
};
const trafficLightArrowSx: SxProps<Theme> = (theme) => ({
  fontSize: theme.spacing(5),
});

export const TrafficLight: React.FC<IProps> = ({ status, ...props }) => {
  const renderTrafficLight = useCallback(
    (trafficLightStatus: TrafficLightEnum): JSX.Element => {
      switch (trafficLightStatus) {
        case TrafficLightEnum.RED_DOWN: {
          return (
            <>
              <RedTraffic {...TRAFFIC_LIGHT_PROPS} />
              <ArrowDownwardIcon sx={trafficLightArrowSx} />
            </>
          );
        }
        case TrafficLightEnum.RED_UP: {
          return (
            <>
              <RedTraffic {...TRAFFIC_LIGHT_PROPS} />
              <ArrowUpwardIcon sx={trafficLightArrowSx} />
            </>
          );
        }
        case TrafficLightEnum.YELLOW_UP: {
          return (
            <>
              <YellowTraffic {...TRAFFIC_LIGHT_PROPS} />
              <ArrowUpwardIcon sx={trafficLightArrowSx} />
            </>
          );
        }
        case TrafficLightEnum.YELLOW_DOWN: {
          return (
            <>
              <YellowTraffic {...TRAFFIC_LIGHT_PROPS} />
              <ArrowDownwardIcon sx={trafficLightArrowSx} />
            </>
          );
        }
        case TrafficLightEnum.GREEN: {
          return (
            <>
              <GreenTraffic {...TRAFFIC_LIGHT_PROPS} />
              <ArrowDownwardIcon
                sx={trafficLightArrowSx}
                style={{ visibility: 'hidden' }}
              />
            </>
          );
        }
        case TrafficLightEnum.NONE: {
          return (
            <>
              <NoneIcon {...TRAFFIC_LIGHT_PROPS} />
              <ArrowDownwardIcon
                sx={trafficLightArrowSx}
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
    []
  );

  return <div {...props}>{renderTrafficLight(status)}</div>;
};

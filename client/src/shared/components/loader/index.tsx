import { useEffect, useState } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import { OrUndefined } from 'src/shared/types';
import Typography from '@mui/material/Typography';
import { useStyles } from './styles';

interface IProps {
  message: string;
  show: boolean;
  className?: string;
  timeout?: number;
}

export const Loader: React.FC<IProps> = ({
  className = ``,
  timeout = 500,
  message,
  show,
}) => {
  const [showLoader, setShowLoader] = useState(false);
  const classes = useStyles();

  useEffect((): void | (() => void) => {
    if (timeout === 0) {
      setShowLoader(true);
      return;
    }

    let time: OrUndefined<NodeJS.Timeout>;

    // * Provides better user experience
    // * If content loads within timeout
    // * Then loader does not need to be shown
    if (show) {
      time = setTimeout(() => {
        setShowLoader(true);
      }, timeout);
    }

    return (): void => {
      if (time) {
        clearTimeout(time);
      }
    };
  }, [show, timeout]);

  return showLoader ? (
    <div className={`${classes.container} ${className}`}>
      <CircularProgress color="primary" />
      <Typography component="p" paragraph={true}>
        {message}
      </Typography>
    </div>
  ) : null;
};

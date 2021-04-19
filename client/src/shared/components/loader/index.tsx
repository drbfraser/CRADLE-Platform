import CircularProgress from '@material-ui/core/CircularProgress';
import { OrUndefined } from 'src/shared/types';
import React from 'react';
import Typography from '@material-ui/core/Typography';
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
  const [showLoader, setShowLoader] = React.useState(false);
  const classes = useStyles();

  React.useEffect((): void | (() => void) => {
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

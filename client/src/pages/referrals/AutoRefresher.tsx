import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
// import EndpointEnum from 'src/shared/enums';

interface IProps {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTimer: number;
}

export const AutoRefresher = ({
  setRefresh,
  refreshTimer,
}: IProps) => {
  const classes = useStyles();

  const [progress, setProgress] = useState<number>(0);
  const [ifAutoRefreshOn, setIfAutoRefreshOn] = useState<boolean>(true);

  React.useEffect(() => {
    setProgress(0);
    const timePerSlice = refreshTimer * 10;
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          setRefresh((prevRefresh) => {return !prevRefresh;});
          return 0;
        } else {
          return prevProgress + 1;
        }
      });
    }, timePerSlice);
    if (refreshTimer === 0) {
      clearInterval(timer);
      setProgress(0);
      setIfAutoRefreshOn(false);
    } else {
      setIfAutoRefreshOn(true);
    }

    return () => {
      clearInterval(timer);
    };
  }, [refreshTimer, setRefresh]);

  return (
    <div className={classes.autoRefreshWrapper}>
      <p className={classes.title}>Auto-Refresh {ifAutoRefreshOn ? "enabled" : "disabled"}</p>
      <CircularProgress className={ifAutoRefreshOn ? classes.alignCenter : classes.nondisplay} variant="determinate" value={progress} />
    </div>
  );
};

export const useStyles = makeStyles((theme) => ({
  nondisplay: {
    display: 'none',
  },
  title: {
    display: 'inline-block',
  },
  autoRefreshWrapper: {
    display: 'inline-block',
    margin: 'auto',
    marginLeft: 15,
  },
  alignCenter: {
    verticalAlign: 'middle',
    margin: 'auto 10px',
  }
}));
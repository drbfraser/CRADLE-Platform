import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';
import { IUserWithTokens, OrNull } from 'src/shared/types';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

interface IProps {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTimer: number;
  setIsRefreshDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type SelectorState = {
  user: OrNull<IUserWithTokens>;
};

export const AutoRefresher = ({
  setRefresh,
  refreshTimer,
  setIsRefreshDialogOpen,
}: IProps) => {
  const classes = useStyles();

  const [progress, setProgress] = useState<number>(0);
  const [ifAutoRefreshOn, setIfAutoRefreshOn] = useState<boolean>(true);
  const userFacility = useRef('');

  const { user } = useSelector(
    ({ user }: ReduxState): SelectorState => ({
      user: user.current.data,
    })
  );

  React.useEffect(() => {
    if (user) {
      userFacility.current = user.healthFacilityName;
    }
    const newReferrals = true;
    const params = new URLSearchParams({
      newReferrals: newReferrals.toString(),
    });
    apiFetch(
      API_URL +
        EndpointEnum.HEALTH_FACILITIES +
        '/' +
        userFacility.current +
        '?' +
        params
    )
      .then((resp) => resp.json())
      .then((jsonResp: string) => {
        const lastRefreshTime = sessionStorage.getItem('lastRefreshTime');
        if (lastRefreshTime === '0') {
          sessionStorage.setItem('lastRefreshTime', jsonResp);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  React.useEffect(() => {
    const newReferrals = true;
    const params = new URLSearchParams({
      newReferrals: newReferrals.toString(),
    });

    setProgress(0);
    const timePerSlice = refreshTimer * 10;
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          apiFetch(
            API_URL +
              EndpointEnum.HEALTH_FACILITIES +
              '/' +
              userFacility.current +
              '?' +
              params
          )
            .then((resp) => resp.json())
            .then((jsonResp: string) => {
              const remoteTimestamp = Number(jsonResp);
              const lastRefreshTime = sessionStorage.getItem('lastRefreshTime');
              if (Number(lastRefreshTime) < remoteTimestamp) {
                setRefresh((prevRefresh) => {
                  return !prevRefresh;
                });
                sessionStorage.setItem('lastRefreshTime', jsonResp);
              }
            })
            .catch((error) => {
              console.error(error);
            });
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
      <Typography
        className={classes.title}
        color="textSecondary"
        variant="overline">
        Auto-Refresh{' '}
      </Typography>
      {ifAutoRefreshOn ? (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          className={classes.enableBtn}
          onClick={() => setIsRefreshDialogOpen(true)}>
          Enabled
        </Button>
      ) : (
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          className={classes.enableBtn}
          onClick={() => setIsRefreshDialogOpen(true)}>
          Disabled
        </Button>
      )}
      <CircularProgress
        className={ifAutoRefreshOn ? classes.CircularProgress : classes.hidden}
        variant="determinate"
        value={progress}
      />
    </div>
  );
};

export const useStyles = makeStyles((theme) => ({
  enableBtn: {
    verticalAlign: 'middle',
    display: 'inline-block',
    margin: 'auto 6px auto 6px',
  },
  hidden: {
    visibility: 'hidden',
    maxWidth: '1.6em',
    verticalAlign: 'middle',
    margin: 'auto 10px',
  },
  title: {
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  autoRefreshWrapper: {
    display: 'inline-block',
    margin: 'auto 0',
  },
  CircularProgress: {
    maxWidth: '1.6em',
    verticalAlign: 'middle',
    margin: 'auto 10px',
  },
}));

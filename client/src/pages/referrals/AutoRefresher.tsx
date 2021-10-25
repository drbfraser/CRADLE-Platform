import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';
import {
  IUserWithTokens,
  OrNull,
} from 'src/shared/types';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';

interface IProps {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTimer: number;
}

type SelectorState = {
  user: OrNull<IUserWithTokens>;
};

export const AutoRefresher = ({
  setRefresh,
  refreshTimer,
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
    const newReferrals : boolean = true;
    const params = new URLSearchParams({
      newReferrals: newReferrals.toString(),
    });

    setProgress(0);
    const timePerSlice = refreshTimer * 10;
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          apiFetch(API_URL + EndpointEnum.HEALTH_FACILITIES + '/' + userFacility.current + '?' + params)
            .then((resp) => resp.json())
            .then((jsonResp: string) => {
              if (Number(jsonResp)>0) {
                setRefresh((prevRefresh) => {return !prevRefresh;});
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

  React.useEffect(() => {
    if (user) {
      userFacility.current = user.healthFacilityName
    }
  }, [user]);

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
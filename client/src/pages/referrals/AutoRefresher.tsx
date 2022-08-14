import { IFacility, IUserWithTokens, OrNull } from 'src/shared/types';
import React, { useState } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import { PrimaryButton } from 'src/shared/components/Button';
import { ReduxState } from 'src/redux/reducers';
import Typography from '@mui/material/Typography';
import { getHealthFacilityAsync } from 'src/shared/api';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';

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
  const [healthFacilityName, setHealthFacilityName] = useState<string>();

  const { user } = useSelector(
    ({ user }: ReduxState): SelectorState => ({
      user: user.current.data,
    })
  );

  React.useEffect(() => {
    user && setHealthFacilityName(user?.healthFacilityName);
  }, [user]);

  React.useEffect(() => {
    setProgress(0);

    if (refreshTimer === 0) {
      setIfAutoRefreshOn(false);
      return;
    }

    setIfAutoRefreshOn(true);

    const timePerSlice = refreshTimer * 10;

    const refreshFacilities = async () => {
      const healthFacility: IFacility = await getHealthFacilityAsync(
        healthFacilityName
      );

      const lastRefreshTime = sessionStorage.getItem('lastRefreshTime');

      if (Number(lastRefreshTime) < healthFacility.newReferrals) {
        setRefresh((prevRefresh) => !prevRefresh);

        sessionStorage.setItem(
          'lastRefreshTime',
          healthFacility.newReferrals.toString()
        );
      }
    };

    const timer = setInterval(
      async () =>
        setProgress((progress) => {
          if (progress < 100) {
            return progress + 1;
          }

          refreshFacilities();

          return 0;
        }),
      timePerSlice
    );

    return () => {
      timer && clearInterval(timer);
    };
  }, [refreshTimer, setRefresh, healthFacilityName]);

  return (
    <div className={classes.autoRefreshWrapper}>
      <Typography
        className={classes.title}
        color="textSecondary"
        variant="overline">
        Auto-Refresh{' '}
      </Typography>
      {ifAutoRefreshOn ? (
        <PrimaryButton
          className={classes.enableBtn}
          onClick={() => setIsRefreshDialogOpen(true)}>
          Enabled
        </PrimaryButton>
      ) : (
        <PrimaryButton
          className={classes.enableBtn}
          onClick={() => setIsRefreshDialogOpen(true)}>
          Disabled
        </PrimaryButton>
      )}
      <CircularProgress
        className={ifAutoRefreshOn ? classes.CircularProgress : classes.hidden}
        variant="determinate"
        value={progress}
      />
    </div>
  );
};

export const useStyles = makeStyles(() => ({
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

import { IFacility, IUserWithTokens, OrNull } from 'src/shared/types';
import React, { useState } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import { PrimaryButton } from 'src/shared/components/Button';
import { ReduxState } from 'src/redux/reducers';
import Typography from '@mui/material/Typography';
import { getHealthFacilityAsync } from 'src/shared/api';
import { useSelector } from 'react-redux';
import { Box, SxProps } from '@mui/material';

const ENABLE_BUTTON_SX: SxProps = {
  verticalAlign: 'middle',
  display: 'inline-block',
  margin: 'auto 6px auto 6px',
};

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
    <Box
      sx={{
        display: 'inline-block',
        margin: 'auto 0',
      }}>
      <Typography
        sx={{
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
        color="textSecondary"
        variant="overline">
        Auto-Refresh{' '}
      </Typography>
      {ifAutoRefreshOn ? (
        <PrimaryButton
          sx={ENABLE_BUTTON_SX}
          onClick={() => setIsRefreshDialogOpen(true)}>
          Enabled
        </PrimaryButton>
      ) : (
        <PrimaryButton
          sx={ENABLE_BUTTON_SX}
          onClick={() => setIsRefreshDialogOpen(true)}>
          Disabled
        </PrimaryButton>
      )}
      <CircularProgress
        sx={ifAutoRefreshOn ? CIRCULAR_PROGRESS_SX : HIDDEN_SX}
        variant="determinate"
        value={progress}
      />
    </Box>
  );
};

const CIRCULAR_PROGRESS_SX: SxProps = {
  maxWidth: '1.6em',
  verticalAlign: 'middle',
  margin: 'auto 10px',
};
const HIDDEN_SX: SxProps = {
  visibility: 'hidden',
  maxWidth: '1.6em',
  verticalAlign: 'middle',
  margin: 'auto 10px',
};

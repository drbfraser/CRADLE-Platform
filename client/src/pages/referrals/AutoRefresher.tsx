import { useState, useEffect } from 'react';
import { Box, CircularProgress, SxProps, Typography } from '@mui/material';

import { getHealthFacilityAsync } from 'src/shared/api/api';
import { PrimaryButton } from 'src/shared/components/Button';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from 'src/shared/hooks/auth/useCurrentUser';

interface IProps {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTimer: number;
  setIsRefreshDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AutoRefresher = ({
  setRefresh,
  refreshTimer,
  setIsRefreshDialogOpen,
}: IProps) => {
  const [progress, setProgress] = useState<number>(0);
  const [isAutoRefreshOn, setIsAutoRefreshOn] = useState<boolean>(true);

  const currentUser = useCurrentUser();
  const healthFacilityName = currentUser?.healthFacilityName ?? '';

  const healthcareFacilityQuery = useQuery({
    queryKey: ['healthcareFacility', healthFacilityName],
    queryFn: () => getHealthFacilityAsync(healthFacilityName),
    enabled: !!currentUser,
  });

  useEffect(() => {
    setProgress(0);

    if (refreshTimer === 0) {
      setIsAutoRefreshOn(false);
      return;
    }
    setIsAutoRefreshOn(true);

    const timePerSlice = refreshTimer * 10;

    const refreshFacilities = async () => {
      if (!healthcareFacilityQuery.data) {
        return;
      }

      const lastRefreshTime = sessionStorage.getItem('lastRefreshTime');
      const newReferrals = healthcareFacilityQuery.data.newReferrals;

      if (Number(lastRefreshTime) < newReferrals) {
        setRefresh((prevRefresh) => !prevRefresh);
        sessionStorage.setItem('lastRefreshTime', newReferrals.toString());
      }
    };

    const timer = setInterval(
      () =>
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
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [
    refreshTimer,
    setRefresh,
    healthFacilityName,
    healthcareFacilityQuery.data,
  ]);

  return (
    <Box>
      <Typography
        sx={{
          verticalAlign: 'middle',
        }}
        color="textSecondary"
        variant="overline">
        Auto-Refresh
      </Typography>

      {isAutoRefreshOn ? (
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
        sx={isAutoRefreshOn ? CIRCULAR_PROGRESS_SX : HIDDEN_SX}
        variant="determinate"
        value={progress}
      />
    </Box>
  );
};

const ENABLE_BUTTON_SX: SxProps = {
  verticalAlign: 'middle',
  margin: 'auto 6px auto 6px',
};
const CIRCULAR_PROGRESS_SX: SxProps = {
  maxWidth: '1.6em',
  verticalAlign: 'middle',
  margin: 'auto 10px',
};
const HIDDEN_SX: SxProps = {
  display: 'none',
};

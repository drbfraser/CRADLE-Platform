import { Box, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { ReferralFilter } from 'src/shared/types/referralTypes';
import { FilterDialog } from '../FilterDialog';
import { AutoRefresher } from '../AutoRefresher';
import { RefreshDialog } from '../RefreshDialog';

type ReferralsToolbarProps = {
  isFilterDialogOpen: boolean;
  isRefreshDialogOpen: boolean;
  isTransformed: boolean;
  filter: ReferralFilter | undefined;
  isPromptShown: boolean;
  refreshTimer: number;
  onFilterDialogClose: () => void;
  onRefreshDialogClose: () => void;
  setFilter: (filter: ReferralFilter) => void;
  setIsPromptShown: (isPromptShown: boolean) => void;
  setRefresh: Dispatch<SetStateAction<boolean>>;
  setRefreshTimer: Dispatch<SetStateAction<number>>;
  setIsRefreshDialogOpen: Dispatch<SetStateAction<boolean>>;
};

export const ReferralsToolbar = ({
  isFilterDialogOpen,
  isRefreshDialogOpen,
  isTransformed,
  filter,
  isPromptShown,
  refreshTimer,
  onFilterDialogClose,
  onRefreshDialogClose,
  setFilter,
  setIsPromptShown,
  setRefresh,
  setRefreshTimer,
  setIsRefreshDialogOpen,
}: ReferralsToolbarProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
    <RefreshDialog
      onClose={onRefreshDialogClose}
      open={isRefreshDialogOpen}
      isTransformed={isTransformed}
      setRefreshTimer={setRefreshTimer}
      refreshTimer={refreshTimer}
    />
    <FilterDialog
      onClose={onFilterDialogClose}
      open={isFilterDialogOpen}
      filter={filter!}
      setFilter={setFilter}
      isTransformed={isTransformed}
      setIsPromptShown={setIsPromptShown}
    />

    <AutoRefresher
      setRefresh={setRefresh}
      refreshTimer={refreshTimer}
      setIsRefreshDialogOpen={setIsRefreshDialogOpen}
    />

    {isPromptShown && (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
        <Typography color="textSecondary" variant="caption">
          Currently filtered to your health facility.
        </Typography>
        <Typography color="textSecondary" variant="caption">
          Click Clear Filter to see all.
        </Typography>
      </Box>
    )}
  </Box>
);

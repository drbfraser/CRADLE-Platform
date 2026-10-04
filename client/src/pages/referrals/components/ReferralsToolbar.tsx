import { Box } from '@mui/material';
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
      flexDirection: {
        xs: 'column',
        md: 'row',
      },
      justifyContent: 'space-between',
      alignItems: {
        xs: 'flex-start',
        md: 'center',
      },
      gap: 1,
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
  </Box>
);

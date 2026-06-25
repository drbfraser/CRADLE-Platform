import { useState, useEffect, useMemo } from 'react';
import { Box, useMediaQuery } from '@mui/material';

import { Toast } from 'src/shared/components/toast';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { BREAKPOINT } from './constants';
import { ReferralsSearchBar } from './components/ReferralsSearchBar';
import { ReferralsToolbar } from './components/ReferralsToolbar';
import { useSecretKeyQuery } from 'src/shared/queries';
import { useCurrentUser } from 'src/shared/hooks/auth/useCurrentUser';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import { getReferralsAsync } from 'src/shared/api';
import { useNavigate } from 'react-router-dom';
import { ReferralFilter } from 'src/shared/types/referralTypes';
import {
  formatReferralRows,
  useReferralColumns,
} from './useReferralColumns';

export const ReferralsPage = () => {
  const currentUser = useCurrentUser();
  const userId = currentUser?.id;

  const [expiredMessage, setExpiredMessage] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<ReferralFilter | undefined>(undefined);
  const [isPromptShown, setIsPromptShown] = useState<boolean>(true);
  const [refresh, setRefresh] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState<number>(60);
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] =
    useState<boolean>(false);

  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);
  const navigate = useNavigate();
  const columns = useReferralColumns();

  const {
    data: referrals = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['referrals', search, filter],
    queryFn: () => getReferralsAsync({ search, filter }),
  });

  const rows = useMemo(() => formatReferralRows(referrals), [referrals]);

  useEffect(() => {
    if (refresh) {
      refetch();
      setRefresh(false);
    }
  }, [refresh, refetch]);

  const { data: secretKeyQueryData } = useSecretKeyQuery(userId);

  useEffect(() => {
    sessionStorage.setItem('lastRefreshTime', '0');
    if (localStorage.getItem('refreshInterval') === null) {
      localStorage.setItem('refreshInterval', '60');
    }
    setRefreshTimer(parseInt(localStorage.getItem('refreshInterval')!));
  }, [userId]);

  useEffect(() => {
    if (secretKeyQueryData) {
      const currentDate = new Date();
      const staleDate = new Date(secretKeyQueryData.staleDate);
      const expiryDate = new Date(secretKeyQueryData.expiryDate);

      const staleDatePassed = currentDate > staleDate;
      const expireDatePassed = currentDate > expiryDate;
      if (staleDatePassed || expireDatePassed) {
        setExpiredMessage(true);
      }
    }
  }, [secretKeyQueryData, userId]);

  return (
    <>
      <Toast
        severity="warning"
        message={"Your key's stale-date has passed, please update it"}
        open={expiredMessage}
        onClose={() => setExpiredMessage(false)}
      />

      <DashboardPaper>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: {
              xs: '15px',
              lg: '30px',
            },
          }}>
          <ReferralsSearchBar
            onSearchChange={setSearch}
            onOpenFilter={() => setIsFilterDialogOpen(true)}
            onClearFilter={() => {
              setFilter(undefined);
              setIsPromptShown(false);
            }}
          />

          <ReferralsToolbar
            isFilterDialogOpen={isFilterDialogOpen}
            isRefreshDialogOpen={isRefreshDialogOpen}
            isTransformed={isTransformed}
            filter={filter}
            isPromptShown={isPromptShown}
            refreshTimer={refreshTimer}
            onFilterDialogClose={() => setIsFilterDialogOpen(false)}
            onRefreshDialogClose={() => setIsRefreshDialogOpen(false)}
            setFilter={setFilter}
            setIsPromptShown={setIsPromptShown}
            setRefresh={setRefresh}
            setRefreshTimer={setRefreshTimer}
            setIsRefreshDialogOpen={setIsRefreshDialogOpen}
          />
        </Box>

        <Box sx={{ clear: 'right' }}>
          <DataTable
            disableVirtualization
            disablePagination
            columns={columns}
            rows={rows}
            loading={isLoading}
            onRowClick={({ row }) => navigate(`/patients/${row.patientId}`)}
            sx={{
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
              },
            }}
          />
        </Box>
      </DashboardPaper>
    </>
  );
};

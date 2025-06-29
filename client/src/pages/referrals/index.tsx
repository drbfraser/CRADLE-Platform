import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { Box, TextField, Typography, useMediaQuery } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import ScheduleIcon from '@mui/icons-material/Schedule';

import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { Toast } from 'src/shared/components/toast';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { useAppDispatch } from 'src/shared/hooks';
import { BREAKPOINT } from './constants';
import { FilterDialog } from './FilterDialog';
import { AutoRefresher } from './AutoRefresher';
import { RefreshDialog } from './RefreshDialog';
import { useSecretKeyQuery } from 'src/shared/queries';
import { useCurrentUser } from 'src/shared/hooks/auth/useCurrentUser';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import { GridColDef } from '@mui/x-data-grid';
import { getReferralsAsync } from 'src/shared/api';
import moment from 'moment';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { TrafficLightEnum } from 'src/shared/enums';
import { useNavigate } from 'react-router-dom';
import { ReferralFilter } from 'src/shared/types';
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

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);
  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);

  const navigate = useNavigate();

  const {
    data: referrals = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['referrals', search, filter],
    queryFn: () => getReferralsAsync({ search, ...filter }),
  });

  const rows = useMemo(
    () =>
      referrals.map((r: any) => ({
        ...r,
        id: r.referralId,
        referralDate: r.dateReferred
          ? moment(Number(r.dateReferred) * 1000).format('YYYY-MM-DD')
          : 'No date',
        lastVitalSign: r.vitalSign ?? TrafficLightEnum.NONE,
      })),
    [referrals]
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'patientName', headerName: 'Name', flex: 1 },
      { field: 'patientId', headerName: 'Patient ID', flex: 1 },
      { field: 'villageNumber', headerName: 'Village Number', flex: 1 },
      {
        field: 'vitalSign',
        headerName: 'Vital Sign when referral',
        flex: 1,
        sortable: false,
        renderCell: ({ value }) => <TrafficLight status={value} />,
      },
      { field: 'referralDate', headerName: 'Date Referred', flex: 1 },
      {
        field: 'isAssessed',
        headerName: 'Assessment',
        flex: 1,
        sortable: false,
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
            }}>
            {row.isAssessed || row.notAttended || row.isCancelled ? (
              <>
                <DoneIcon sx={{ padding: '2px', color: '#4caf50' }} />
                Complete
              </>
            ) : (
              <>
                <ScheduleIcon sx={{ padding: '2px', color: '#f44336' }} />
                Pending
              </>
            )}
          </Box>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    if (refresh) {
      refetch();
      setRefresh(false);
    }
  }, [refresh, refetch]);

  const { data: secretKeyQueryData } = useSecretKeyQuery(userId);

  const dispatch = useAppDispatch();
  useEffect(() => {
    sessionStorage.setItem('lastRefreshTime', '0');
    if (localStorage.getItem('refreshInterval') === null) {
      localStorage.setItem('refreshInterval', '60');
    }
    setRefreshTimer(parseInt(localStorage.getItem('refreshInterval')!));
  }, [dispatch, userId]);

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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
            <Typography
              variant="h2"
              sx={{
                textAlign: 'center',
                verticalAlign: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}>
              Referrals
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '0.5rem',
                height: '50px',
                alignItems: 'center',
                '& .MuiInputBase-root': {
                  height: '50px',
                  width: '180px',
                },
              }}>
              <TextField
                label="Search"
                data-testid="search-input"
                placeholder="Patient ID, Name or Village"
                variant="outlined"
                onChange={(e) => debounceSetSearch(e.target.value)}
              />

              <PrimaryButton
                sx={{
                  height: '100%',
                  fontSize: 'large',
                  '@media (max-width: 720px)': {
                    fontSize: 'medium',
                  },
                }}
                onClick={() => setIsFilterDialogOpen(true)}>
                Filter Search
              </PrimaryButton>

              <CancelButton
                sx={{
                  height: '100%',
                  fontSize: 'large',
                  '@media (max-width: 720px)': {
                    fontSize: 'medium',
                  },
                }}
                onClick={() => {
                  setFilter(undefined);
                  setIsPromptShown(false);
                }}
                className="mx-auto">
                Clear Filter
              </CancelButton>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <RefreshDialog
              onClose={() => {
                setIsRefreshDialogOpen(false);
              }}
              open={isRefreshDialogOpen}
              isTransformed={isTransformed}
              setRefreshTimer={setRefreshTimer}
              refreshTimer={refreshTimer}
            />
            <FilterDialog
              onClose={() => {
                setIsFilterDialogOpen(false);
              }}
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
        </Box>

        <Box
          sx={{
            clear: 'right',
          }}>
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

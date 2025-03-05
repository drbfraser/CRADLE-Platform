import { useState, useEffect } from 'react';
import { debounce, parseInt } from 'lodash';
import { Box, TextField, Typography, useMediaQuery } from '@mui/material';

import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { APITable } from 'src/shared/components/apiTable';
import { EndpointEnum } from 'src/shared/enums';
import { ReferralFilter } from 'src/shared/types';
import { SortDir } from 'src/shared/components/apiTable/types';
import { useAppDispatch, useAppSelector } from 'src/shared/hooks';
import { Toast } from 'src/shared/components/toast';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { selectCurrentUser } from 'src/redux/reducers/user/currentUser';
import { BREAKPOINT, COLUMNS, SORTABLE_COLUMNS } from './constants';
import { FilterDialog } from './FilterDialog';
import { AutoRefresher } from './AutoRefresher';
import { ReferralRow } from './ReferralRow';
import { RefreshDialog } from './RefreshDialog';
import { useSecretKeyQuery } from 'src/shared/queries';

export const ReferralsPage = () => {
  const { data: user } = useAppSelector(selectCurrentUser);
  const userId = user?.id;

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
          <APITable
            endpoint={EndpointEnum.REFERRALS}
            search={search}
            columns={COLUMNS}
            sortableColumns={SORTABLE_COLUMNS}
            rowKey={'referralId'}
            initialSortBy={'dateReferred'}
            initialSortDir={SortDir.DESC}
            RowComponent={ReferralRow}
            isTransformed={isTransformed}
            referralFilter={filter}
            refetch={refresh}
            isReferralListPage={true}
          />
        </Box>
      </DashboardPaper>
    </>
  );
};

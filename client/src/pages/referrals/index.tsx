import { BREAKPOINT, COLUMNS, SORTABLE_COLUMNS } from './constants';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import React, { useState } from 'react';
import { debounce, parseInt } from 'lodash';
import { useSelector } from 'react-redux';

import { APITable } from 'src/shared/components/apiTable';
import { AutoRefresher } from './AutoRefresher';
import { EndpointEnum, SecretKeyMessage } from 'src/shared/enums';
import { FilterDialog } from './FilterDialog';
import { ReferralFilter } from 'src/shared/types';
import { ReferralRow } from './ReferralRow';
import { RefreshDialog } from './RefreshDialog';
import { SortDir } from 'src/shared/components/apiTable/types';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAppDispatch } from 'src/shared/hooks';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SecretKeyState, getSecretKey } from 'src/redux/reducers/secretKey';
import { ReduxState } from 'src/redux/reducers';
import { Toast } from 'src/shared/components/toast';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { Box, SxProps, useTheme } from '@mui/material';

export const ReferralsPage = () => {
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
  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);

  const userId = useSelector(({ user }: ReduxState): number | undefined => {
    return user.current.data?.userId;
  });
  const secretKey = useSelector(({ secretKey }: ReduxState): SecretKeyState => {
    return secretKey;
  });
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    sessionStorage.setItem('lastRefreshTime', '0');
    if (localStorage.getItem('refreshInterval') === null) {
      localStorage.setItem('refreshInterval', '60');
    }
    setRefreshTimer(parseInt(localStorage.getItem('refreshInterval')!));

    if (userId && secretKey.data == undefined) {
      dispatch(getSecretKey(userId));
    }
  }, []);

  React.useEffect(() => {
    if (
      userId &&
      secretKey.data !== undefined &&
      (secretKey.data.message === SecretKeyMessage.WARN ||
        secretKey.data.message === SecretKeyMessage.EXPIRED)
    ) {
      setExpiredMessage(true);
    }
  }, [secretKey]);

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
            padding: '15px',
          }}>
          <Box
            sx={{
              display: 'inline-block',
            }}>
            <Typography
              variant="h2"
              sx={{
                display: 'inline-block',
                fontSize: '1.7rem',
                fontWeight: 'bold',
              }}>
              Referrals
            </Typography>
            <Box
              sx={{
                marginTop: '16px',
              }}>
              <AutoRefresher
                setRefresh={setRefresh}
                refreshTimer={refreshTimer}
                setIsRefreshDialogOpen={setIsRefreshDialogOpen}
              />
            </Box>
          </Box>

          {!isBigScreen && <br />}
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
          <Box sx={isBigScreen ? SEARCH_SX : SEARCH_THIN_SX}>
            <Box>
              <TextField
                label="Search"
                placeholder="Patient ID, Name or Village"
                variant="outlined"
                onChange={(e) => debounceSetSearch(e.target.value)}
              />
              {isPromptShown && (
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Currently filtered to your health facility.
                    <br />
                    Click Clear Filter to see all.
                  </Typography>
                </Box>
              )}
            </Box>

            <PrimaryButton onClick={() => setIsFilterDialogOpen(true)}>
              Filter Search
            </PrimaryButton>

            <CancelButton
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

const SEARCH_SX: SxProps = {
  float: 'right',
  display: 'flex',
  alignItems: 'self-start',
  columnGap: '10px',
};
const SEARCH_THIN_SX: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  rowGap: '10px',
};

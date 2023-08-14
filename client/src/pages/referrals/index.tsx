import { BREAKPOINT, COLUMNS, SORTABLE_COLUMNS } from './constants';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import React, { useState } from 'react';
import { debounce, parseInt } from 'lodash';
import { useSelector } from 'react-redux';

import { APITable } from 'src/shared/components/apiTable';
import { AutoRefresher } from './AutoRefresher';
import { EndpointEnum, SecretKeyMessage } from 'src/shared/enums';
import { FilterDialog } from './FilterDialog';
import Paper from '@mui/material/Paper';
import { ReferralFilter } from 'src/shared/types';
import { ReferralRow } from './ReferralRow';
import { RefreshDialog } from './RefreshDialog';
import { SortDir } from 'src/shared/components/apiTable/types';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { useAppDispatch, useDimensionsContext } from 'src/app/context/hooks';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  SecretKeyState,
  getSecretKey,
  updateSecretKey,
} from 'src/redux/reducers/secretKey';
import { ReduxState } from 'src/redux/reducers';
import { Toast } from 'src/shared/components/toast';

export const ReferralsPage = () => {
  const classes = useStyles();
  const [updateMessage, setUpdateMessage] = useState<boolean>(false);
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
  const { isBigScreen } = useDimensionsContext();
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
      secretKey.data.message !== SecretKeyMessage.NORMAL
    ) {
      dispatch(updateSecretKey(userId));
      setUpdateMessage(true);
    }
  }, [secretKey]);

  return (
    <>
      <Toast
        severity="error"
        message={
          "Your key's Stale-date passed, so your key is updated automatically by server"
        }
        open={updateMessage}
        onClose={() => setUpdateMessage(false)}
      />
      <Paper className={classes.wrapper}>
        <div className={classes.topWrapper}>
          <div className={classes.title}>
            <h2 className={classes.title}>Referrals</h2>
            <div>
              <AutoRefresher
                setRefresh={setRefresh}
                refreshTimer={refreshTimer}
                setIsRefreshDialogOpen={setIsRefreshDialogOpen}
              />
            </div>
          </div>

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
          <div className={isBigScreen ? classes.search : classes.searchThin}>
            <div>
              <TextField
                label="Search"
                placeholder="Patient ID, Name or Village"
                variant="outlined"
                onChange={(e) => debounceSetSearch(e.target.value)}
              />
              {isPromptShown && (
                <div>
                  <Typography color="textSecondary" variant="caption">
                    Currently filtered to your health facility.
                    <br />
                    Click Clear Filter to see all.
                  </Typography>
                </div>
              )}
            </div>

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
          </div>
        </div>

        <div className={classes.table}>
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
        </div>
      </Paper>
    </>
  );
};

const useStyles = makeStyles({
  wrapper: {
    backgroundColor: '#fff',
  },
  topWrapper: {
    padding: 15,
  },
  title: {
    display: 'inline-block',
  },
  search: {
    float: 'right',
    display: 'flex',
    alignItems: 'self-start',
    columnGap: '10px',
  },
  searchThin: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '10px',
  },
  table: {
    clear: 'right',
  },
});

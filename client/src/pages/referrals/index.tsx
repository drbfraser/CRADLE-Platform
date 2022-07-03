import { BREAKPOINT, COLUMNS, SORTABLE_COLUMNS } from './constants';
import React, { useState } from 'react';
import { debounce, parseInt } from 'lodash';

import { APITable } from 'src/shared/components/apiTable';
import { AutoRefresher } from './AutoRefresher';
import { EndpointEnum } from 'src/shared/enums';
import { FilterDialog } from './FilterDialog';
import Paper from '@material-ui/core/Paper';
import { ReferralFilter } from 'src/shared/types';
import { ReferralRow } from './ReferralRow';
import { RefreshDialog } from './RefreshDialog';
import { SortDir } from 'src/shared/components/apiTable/types';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { PrimaryButton } from 'src/shared/components/primaryButton';
import { SecondaryButton } from 'src/shared/components/SecondaryButton';

export const ReferralsPage = () => {
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<ReferralFilter>();
  const [isPromptShown, setIsPromptShown] = useState<boolean>(true);
  const [refresh, setRefresh] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState<number>(60);
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] =
    useState<boolean>(false);

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  const isBigScreen = useMediaQuery('(min-width:440px)');
  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);

  React.useEffect(() => {
    sessionStorage.setItem('lastRefreshTime', '0');
    if (localStorage.getItem('refreshInterval') === null) {
      localStorage.setItem('refreshInterval', '60');
    }
    setRefreshTimer(parseInt(localStorage.getItem('refreshInterval')!));
  }, []);

  return (
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
        <PrimaryButton
          text="Filter Search"
          task={() => {
            setIsFilterDialogOpen(true)}}
          position = "right"
        />
        <SecondaryButton
          text="Clear Filter"
          task={() => {
            setFilter(undefined);
            setIsPromptShown(false);
          }}
          position = "right"
        />
        
        <div className={isBigScreen ? classes.right : classes.searchThin}>
          <TextField
            label="Search"
            placeholder="Patient ID, Name or Village"
            variant="outlined"
            onChange={(e) => debounceSetSearch(e.target.value)}
          />
          {isPromptShown && (
            <>
              <br />
              <Typography color="textSecondary" variant="caption">
                Currently filtered to your health facility.
                <br />
                Click Clear Filter to see all.
              </Typography>
            </>
          )}
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
  right: {
    float: 'right',
    padding: 10,
  },
  searchThin: {
    float: 'left',
    marginLeft: 1,
    width: '500px',
  },
  table: {
    clear: 'right',
  },
});

import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { APITable } from 'src/shared/components/apiTable';
import { EndpointEnum } from 'src/shared/enums';
import { ReferralRow } from './ReferralRow';
import { COLUMNS, BREAKPOINT, SORTABLE_COLUMNS } from './constants';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { SortDir } from 'src/shared/components/apiTable/types';
import { FilterDialog } from './FilterDialog';
import { ReferralFilter } from 'src/shared/types';
import ButtonGroup from '@material-ui/core/ButtonGroup';

export const ReferralsPage = () => {
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<ReferralFilter>();

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  const isBigScreen = useMediaQuery('(min-width:440px)');
  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);

  return (
    <Paper className={classes.wrapper}>
      <div className={classes.topWrapper}>
        <h2 className={classes.title}>Referrals</h2>
        <FilterDialog
          onClose={() => {
            setIsFilterDialogOpen(false);
          }}
          open={isFilterDialogOpen}
          filter={filter!}
          setFilter={setFilter}
          isTransformed={isTransformed}
        />
        <ButtonGroup
          orientation="vertical"
          color="primary"
          aria-label="vertical contained primary button group"
          variant="text"
          className={classes.right}>
          <Button
            onClick={() => {
              setIsFilterDialogOpen(true);
            }}>
            Advanced Search
          </Button>

          {filter && (
            <Button
              onClick={() => {
                setFilter(undefined);
              }}>
              Clear Filter
            </Button>
          )}
        </ButtonGroup>

        <TextField
          className={isBigScreen ? classes.right : classes.searchThin}
          label="Search"
          placeholder="Patient ID or Name"
          variant="outlined"
          onChange={(e) => debounceSetSearch(e.target.value)}
        />
      </div>
      <div className={classes.table}>
        <APITable
          endpoint={EndpointEnum.REFERRALS}
          search={search}
          columns={COLUMNS}
          sortableColumns={SORTABLE_COLUMNS}
          rowKey={'referralId'}
          initialSortBy={'patientName'}
          initialSortDir={SortDir.ASC}
          RowComponent={ReferralRow}
          isTransformed={isTransformed}
          referralFilter={filter}
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
    display: 'block',
    marginLeft: 1,
  },
  table: {
    clear: 'right',
  },
});

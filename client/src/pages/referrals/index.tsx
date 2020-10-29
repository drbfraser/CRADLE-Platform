import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';
import { Toast } from '../../../src/shared/components/toast';
import { EndpointEnum } from '../../../src/server';
import { BASE_URL } from '../../../src/server/utils';
import { ReferralTable } from './ReferralTable';
import { IReferral, SortDir } from './types';
import Paper from '@material-ui/core/Paper';
import Pagination from '../../../src/shared/components/pagination/Pagination';

export const ReferralsPage = () => {
  const [referrals, setReferrals] = useState<IReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('patientName');
  const [sortDir, setSortDir] = useState(SortDir.ASC);
  const prevPage = useRef(1);

  const classes = useStyles();

  // when something changes, load new data
  useEffect(() => {
    // if the user changed something other than the page number
    // then reset to page 1
    if (page === prevPage.current && page !== 1) {
      setPage(1);
      return;
    } else {
      prevPage.current = page;
    }

    setLoading(true);

    // allow aborting a fetch early if the user clicks things rapidly
    const controller = new AbortController();

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      signal: controller.signal,
    };

    const params =
      '?' +
      new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        search: search,
        sortBy: sortBy,
        sortDir: sortDir,
      });

    fetch(BASE_URL + EndpointEnum.REFERRALS + params, fetchOptions)
      .then(async (resp) => {
        const json = await resp.json();
        setReferrals(json);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setLoadingError(true);
          setLoading(false);
        }
      });

    // if the user does something else, cancel the fetch
    return () => controller.abort();
  }, [limit, page, search, sortBy, sortDir]);

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  return (
    <Paper className={classes.wrapper}>
      {loadingError && (
        <Toast
          status="error"
          message="Something went wrong on our end. Please try that again."
          clearMessage={() => setLoadingError(false)}
        />
      )}
      <div className={classes.loadingWrapper}>
        {loading && <LinearProgress />}
      </div>
      <div className={classes.topWrapper}>
        <h2 className={classes.title}>Referrals</h2>
        <TextField
          className={classes.search}
          label="Search"
          placeholder="Patient ID or Name"
          variant="outlined"
          onChange={(e) => debounceSetSearch(e.target.value)}
        />
      </div>
      {referrals.length ? (
        <div className={classes.tableWrapper}>
          <ReferralTable
            referrals={referrals}
            sortBy={sortBy}
            sortDir={sortDir}
            setSortBy={setSortBy}
            setSortDir={setSortDir}
          />
        </div>
      ) : (
        <div className={classes.messageWrapper}>
          {loading ? 'Getting referral data...' : 'No records to display.'}
        </div>
      )}
      <Pagination
        dataLen={referrals.length}
        page={page}
        limit={limit}
        setPage={setPage}
        setLimit={setLimit}
      />
    </Paper>
  );
};

const useStyles = makeStyles({
  wrapper: {
    backgroundColor: '#fff',
  },
  loadingWrapper: {
    height: 15,
  },
  topWrapper: {
    padding: '10px 15px',
  },
  title: {
    display: 'inline-block',
  },
  search: {
    float: 'right',
  },
  tableWrapper: {
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  messageWrapper: {
    textAlign: 'center',
    padding: '15px',
  },
});

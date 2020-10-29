import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';
import { Toast } from '../../../src/shared/components/toast';
import { EndpointEnum } from '../../../src/server';
import { BASE_URL } from '../../../src/server/utils';
import { PatientTable } from './PatientTable';
import { IPatient, SortDir } from './types';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { IconButton } from '@material-ui/core';

export const PatientsPage = () => {
  const [patients, setPatients] = useState<IPatient[]>([]);
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

    fetch(BASE_URL + EndpointEnum.PATIENTS + params, fetchOptions)
      .then(async (resp) => {
        const json = await resp.json();
        setPatients(json);
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

  const startRecordNum = ((page - 1) * limit) + 1;
  const endRecordNum = startRecordNum + patients.length - 1;
  const canPageBackward = page !== 1;
  // since we don't know how many records there are
  // guess that if we're at the limit there are more
  const canPageForward = patients.length === limit;

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
        <h2 className={classes.title}>Patients</h2>
        <TextField
          className={classes.search}
          label="Search"
          placeholder="Patient ID or Name"
          variant="outlined"
          onChange={(e) => debounceSetSearch(e.target.value)}
        />
      </div>
      {patients.length ? (
        <div className={classes.tableWrapper}>
          <PatientTable
            patients={patients}
            sortBy={sortBy}
            sortDir={sortDir}
            setSortBy={setSortBy}
            setSortDir={setSortDir}
          />
        </div>
      ) : (
        <div className={classes.messageWrapper}>
          {loading ? 'Getting patient data...' : 'No records to display.'}
        </div>
      )}
      <div className={classes.footer}>
        Records {startRecordNum} - {endRecordNum}.
        Rows per page: &nbsp;
        <Select
          value={limit}
          onChange={(e) => setLimit(e.target.value as number)}>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
        <IconButton
          disabled={!canPageBackward}
          onClick={() => setPage(page - 1)}>
          <NavigateBeforeIcon />
        </IconButton>
        <IconButton
          disabled={!canPageForward}
          onClick={() => setPage(page + 1)}>
          <NavigateNextIcon />
        </IconButton>
      </div>
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
  footer: {
    textAlign: 'right',
    padding: 15,
  },
});

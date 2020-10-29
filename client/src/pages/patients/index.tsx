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

export const PatientsPage = () => {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [limit] = useState(10);
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

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
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
      })
      .catch(() => setLoadingError(true))
      .finally(() => setLoading(false));
  }, [limit, page, search, sortBy, sortDir]);

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  return (
    <div className={classes.wrapper}>
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
        <>
          <PatientTable
            patients={patients}
            sortBy={sortBy}
            sortDir={sortDir}
            setSortBy={setSortBy}
            setSortDir={setSortDir}
          />
          Records {(page - 1) * limit + 1} - {limit}. Rows per page: {limit}
        </>
      ) : (
        <div className={classes.messageWrapper}>
          {loading ? 'Getting patient data...' : 'No records to display.'}
        </div>
      )}
    </div>
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
  messageWrapper: {
    textAlign: 'center',
    padding: '15px',
  },
});

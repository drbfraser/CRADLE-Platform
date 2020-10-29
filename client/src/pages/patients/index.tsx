import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import React, { useState, useEffect } from 'react';
import { EndpointEnum } from '../../../src/server';
import { BASE_URL } from '../../../src/server/utils';
import { PatientTable } from './PatientTable';
import { IPatient } from './types';

export const PatientsPage = () => {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(10);
  const [page] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy] = useState('patientName');
  const [sortDir] = useState('asc');

  const classes = useStyles();

  useEffect(() => {
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
        setLoading(false);
      })
      .catch((e) => console.error(e)); // TODO properly handle error
  }, [limit, page, search, sortBy, sortDir]);

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  return (
    <div className={classes.wrapper}>
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
          <PatientTable patients={patients} />
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

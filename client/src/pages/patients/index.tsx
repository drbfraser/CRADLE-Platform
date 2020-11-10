import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { EndpointEnum } from '../../../src/server';
import { APITable } from '../../../src/shared/components/apiTable';
import { PatientRow } from './PatientRow';

const columns = {
  patientName: 'Patient Name',
  patientId: 'Patient ID',
  villageNumber: 'Village',
  trafficLightStatus: 'Vital Sign',
  dateTimeTaken: 'Last Reading Date',
};

export const PatientsPage = () => {
  const classes = useStyles();
  const [search, setSearch] = useState('');

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  return (
    <Paper className={classes.wrapper}>
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
      <APITable
        endpoint={EndpointEnum.PATIENTS}
        search={search}
        columns={columns}
        rowKey={'patientId'}
        RowComponent={PatientRow}
      />
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
  search: {
    float: 'right',
  },
});

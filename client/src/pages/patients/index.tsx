import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { EndpointEnum } from '../../../src/server';
import { APITable } from '../../../src/shared/components/apiTable';
import { PatientRow } from './PatientRow';
import { useHistory } from 'react-router-dom';

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
  const history = useHistory();

  const handleNewPatientClick = () => {
    history.push('/patients/new');
  };

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  return (
    <Paper className={classes.wrapper}>
      <div className={classes.topWrapper}>
        <h2 className={classes.title}>Patients</h2>
        <div className={classes.right}>
          <TextField
            label="Search"
            placeholder="Patient ID or Name"
            variant="outlined"
            onChange={(e) => debounceSetSearch(e.target.value)}
          />
          <Button
            className={classes.button}
            color="primary"
            variant="contained"
            size="large"
            onClick={handleNewPatientClick}>
            <AddIcon />
            New Patient
          </Button>
        </div>
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
  right: {
    float: 'right',
    height: 56,
  },
  button: {
    height: '100%',
    marginLeft: 10,
  },
});

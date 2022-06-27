//import { SecondaryButton } from 'src/shared/components/SecondaryButton';
//import Button from '@material-ui/core/Button';
//import AddIcon from '@material-ui/icons/Add';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { APITable } from 'src/shared/components/apiTable';
import { PatientRow } from './PatientRow';
import { useHistory } from 'react-router-dom';
import { EndpointEnum } from 'src/shared/enums';
import { COLUMNS, BREAKPOINT, SORTABLE_COLUMNS } from './constants';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { SortDir } from 'src/shared/components/apiTable/types';
import { PrimaryButton } from 'src/shared/components/primaryButton';

export const PatientsPage = () => {
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const history = useHistory();

  
  const handleNewPatientClick = () => {
    history.push('/patients/new');
  };

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  const isBigScreen = useMediaQuery('(min-width:580px)');
  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);

  return (
    <Paper className={classes.wrapper}>
      <div className={classes.topWrapper}>
        <h2 className={classes.title}>Patients</h2>
        <div className={isBigScreen ? classes.right : ''}>
          <TextField
            size ="small"
            label="Search"
            placeholder="PatientID or Name"
            variant="outlined"
            onChange={(e) => debounceSetSearch(e.target.value)}
          />
          <PrimaryButton
              text = "New Patient"
              position = "no right"
              task={handleNewPatientClick}
              
          />
        </div>
      </div>
      <APITable
        endpoint={EndpointEnum.PATIENTS}
        search={search}
        columns={COLUMNS}
        sortableColumns={SORTABLE_COLUMNS}
        rowKey={'patientId'}
        initialSortBy={'patientName'}
        initialSortDir={SortDir.ASC}
        RowComponent={PatientRow}
        isTransformed={isTransformed}
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
  searchThin: {
    display: 'block',
    marginLeft: 1,
  },
  button: {
    height: '100%',
    marginLeft: 10,
  },
  buttonThin: {
    display: 'block',
    marginTop: 8,
    marginLeft: 1,
  },
});

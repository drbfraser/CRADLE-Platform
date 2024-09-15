import { BREAKPOINT, COLUMNS, SORTABLE_COLUMNS } from './constants';

import { APITable } from 'src/shared/components/apiTable';
import { EndpointEnum } from 'src/shared/enums';
import { PatientRow } from './PatientRow';
import { PrimaryButton } from 'src/shared/components/Button';
import { SortDir } from 'src/shared/components/apiTable/types';
import TextField from '@mui/material/TextField';
import { debounce } from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import { useHistory } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';
import { DashboardWrapper } from 'src/shared/components/dashboard/DashboardWrapper';
import { useTheme } from '@mui/material';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';

export const PatientsPage = () => {
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const history = useHistory();

  const handleNewPatientClick = () => {
    history.push('/patients/new');
  };

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);

  return (
    <DashboardWrapper>
      <DashboardPaper>
        <div className={classes.topWrapper}>
          <h2 className={classes.title}>Patients</h2>
          <div className={isBigScreen ? classes.right : ''}>
            <TextField
              data-testid="search-input"
              size="small"
              label="Search"
              placeholder="PatientID or Name"
              variant="outlined"
              onChange={(e) => debounceSetSearch(e.target.value)}
            />
            <PrimaryButton
              onClick={handleNewPatientClick}
              data-testid="new patient button">
              New Patient
            </PrimaryButton>
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
      </DashboardPaper>
    </DashboardWrapper>
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

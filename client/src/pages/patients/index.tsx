import { BREAKPOINT, COLUMNS, SORTABLE_COLUMNS } from './constants';

import { APITable } from 'src/shared/components/apiTable';
import { EndpointEnum } from 'src/shared/enums';
import { PatientRow } from './PatientRow';
import { PrimaryButton } from 'src/shared/components/Button';
import { SortDir } from 'src/shared/components/apiTable/types';
import TextField from '@mui/material/TextField';
import { debounce } from 'lodash';
import { useHistory } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';

export const PatientsPage = () => {
  const [search, setSearch] = useState('');
  const history = useHistory();

  const handleNewPatientClick = () => {
    history.push('/patients/new');
  };

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  const isTransformed = useMediaQuery(`(min-width:${BREAKPOINT}px)`);

  return (
    <DashboardPaper>
      <Box
        sx={{
          padding: {
            xs: '15px',
            lg: '30px',
          },
        }}>
        <Typography
          variant="h2"
          sx={{
            display: 'inline-block',
            fontSize: '1.7rem',
            fontWeight: '700',
          }}>
          Patients
        </Typography>
        <Box
          sx={(theme) => ({
            [theme.breakpoints.up('lg')]: {
              float: 'right',
              height: '56px',
            },
          })}>
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
        </Box>
      </Box>
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
  );
};

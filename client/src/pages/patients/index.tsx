import { Box, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import debounce from 'lodash/debounce';
import { useState, useMemo } from 'react';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { PrimaryButton } from 'src/shared/components/Button';
import { Link } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import { GridColDef } from '@mui/x-data-grid';
import { getPatientsAsync } from 'src/shared/api';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { TrafficLightEnum } from 'src/shared/enums';
import moment from 'moment';

export const PatientsPage = () => {
  const [search, setSearch] = useState('');
  const debounceSetSearch = useMemo(() => debounce(setSearch, 500), []);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', search],
    queryFn: () => getPatientsAsync(search),
  });
  const rows = useMemo(
    () =>
      patients.map((p: any) => {
        const patientId = p.patientId ?? p.id;
        return {
          ...p,
          id: patientId,
          patientId,
          lastReadingDate: p.dateTaken
            ? moment(Number(p.dateTaken) * 1000).format('YYYY-MM-DD')
            : 'No reading',
          trafficLightStatus: p.trafficLightStatus ?? TrafficLightEnum.NONE,
        };
      }),
    [patients]
  );
  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'name', headerName: 'Name', flex: 1 },
      { field: 'patientId', headerName: 'Patient ID', flex: 1 },
      { field: 'villageNumber', headerName: 'Village Number', flex: 1 },
      {
        field: 'trafficLightStatus',
        headerName: 'Last Vital Sign',
        flex: 1,
        sortable: false,
        renderCell: ({ value }) => <TrafficLight status={value} />,
      },
      { field: 'lastReadingDate', headerName: 'Last Reading Date', flex: 1 },
    ],
    []
  );

  return (
    <DashboardPaper>
      {/* header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginRight: '1rem',
          width: '100%',
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

        {/* search + new button */}
        <Box
          sx={(theme) => ({
            marginLeft: 'auto',
            display: 'flex',
            flexDirection: 'row',
            gap: '0.5rem',
            alignItems: 'center',
            [theme.breakpoints.up('lg')]: {
              float: 'right',
              height: '56px',
            },
          })}>
          <TextField
            data-testid="search-input"
            size="small"
            label="Search"
            placeholder="Patient ID or Name"
            variant="outlined"
            onChange={(e) => debounceSetSearch(e.target.value)}
          />
          <PrimaryButton
            component={Link}
            to={'/patients/new'}
            data-testid="new-patient-button">
            New Patient
          </PrimaryButton>
        </Box>
      </Box>

      {/* DataGrid */}
      <DataTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        disableVirtualization
        sx={{
          '& .MuiDataGrid-row:hover': {
            cursor: 'pointer',
          },
        }}
      />
    </DashboardPaper>
  );
};

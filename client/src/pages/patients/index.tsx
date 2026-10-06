import { useMediaQuery, Box, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import debounce from 'lodash/debounce';
import { useState, useMemo, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';

export const PatientsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debounceSetSearch = useMemo(() => debounce(setSearch, 500), []);
  const isMobile = useMediaQuery('(max-width:720px)');

  useEffect(() => {
    return () => {
      debounceSetSearch.cancel();
    };
  }, [debounceSetSearch]);

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
            fontSize: {
              xs: '1.35rem',
              md: '2rem',
              sm: '1.75rem',
            },
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
            '& .MuiInputBase-root': {
              height: {
                xs: '40px',
                sm: '45px',
                md: '50px',
              },
              width: {
                xs: '70px',
                sm: '180px',
                md: '220px',
              },
              // for screens smaller than 375px
              '@media (max-width: 375px)': {
                width: '60px',
              },
            },
            [theme.breakpoints.up('lg')]: {
              float: 'right',
              height: '56px',
            },
          })}>
          <TextField
            data-testid="search-input"
            size="small"
            label="Search"
            placeholder={isMobile ? 'ID/Name' : 'Patient ID or Name'}
            variant="outlined"
            onChange={(e) => debounceSetSearch(e.target.value)}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: {
                  xs: '0.70rem',
                  sm: '0.875rem',
                  md: '1rem',
                },
              },
              '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
                transform: {
                  xs: 'translate(13px, 13px) scale(1)',
                  sm: 'translate(14px, 12px) scale(1)',
                  md: 'translate(14px, 15px) scale(1)',
                },
                fontSize: {
                  xs: '0.70em',
                  sm: '0.875rem',
                  md: '1rem',
                },
              },
            }}
          />
          <PrimaryButton
            component={Link}
            to={'/patients/new'}
            data-testid="new-patient-button"
            sx={{
              height: {
                xs: '40px',
                sm: '40px',
                md: '50px',
              },
              width: {
                xs: '120px',
                sm: '180px',
                md: '220px',
              },
              fontSize: {
                xs: '0.70rem',
                sm: 'medium',
                md: 'large',
              },
              // for screens smaller than 375px
              '@media (max-width: 375px)': {
                width: '60px',
              },
            }}>
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
        disablePagination
        onRowClick={({ row }) => navigate(`/patients/${row.patientId}`)}
        sx={{
          '& .MuiDataGrid-row:hover': {
            cursor: 'pointer',
          },
        }}
      />
    </DashboardPaper>
  );
};

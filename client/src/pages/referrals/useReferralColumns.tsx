import { useMemo } from 'react';
import { Box } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { TrafficLightEnum } from 'src/shared/enums';

export const useReferralColumns = () =>
  useMemo<GridColDef[]>(
    () => [
      { field: 'patientName', headerName: 'Name', flex: 1 },
      { field: 'patientId', headerName: 'Patient ID', flex: 1 },
      { field: 'villageNumber', headerName: 'Village Number', flex: 1 },
      {
        field: 'vitalSign',
        headerName: 'Vital Sign when referral',
        flex: 1,
        sortable: false,
        renderCell: ({ value }) => <TrafficLight status={value} />,
      },
      { field: 'referralDate', headerName: 'Date Referred', flex: 1 },
      {
        field: 'isAssessed',
        headerName: 'Assessment',
        flex: 1,
        sortable: false,
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
            }}>
            {row.isAssessed || row.notAttended || row.isCancelled ? (
              <>
                <DoneIcon sx={{ padding: '2px', color: '#4caf50' }} />
                Complete
              </>
            ) : (
              <>
                <ScheduleIcon sx={{ padding: '2px', color: '#f44336' }} />
                Pending
              </>
            )}
          </Box>
        ),
      },
    ],
    []
  );

export const formatReferralRows = (referrals: Array<Record<string, unknown>>) =>
  referrals.map((r) => ({
    ...r,
    id: r.referralId,
    referralDate: r.dateReferred
      ? moment(Number(r.dateReferred) * 1000).format('YYYY-MM-DD')
      : 'No date',
    lastVitalSign: r.vitalSign ?? TrafficLightEnum.NONE,
  }));

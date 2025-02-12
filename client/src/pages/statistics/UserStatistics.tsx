import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Divider,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';

import {
  getUserStatisticsExportAsync,
  getUsersAsync,
} from 'src/shared/api/api';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ExportStatistics } from './utils/ExportStatistics';
import { StatisticDashboard } from './utils/StatisticsDashboard';
import { DIVIDER_SX, STATS_PAGE_SX } from './utils/statisticStyles';
import { useUserStatsQuery } from './utils/queries';

type Props = {
  from: number;
  to: number;
};

export const UserStatistics = ({ from, to }: Props) => {
  const [user, setUser] = useState('');

  const userStatsQuery = useUserStatsQuery(user, from, to);
  const allUsersQuery = useQuery({
    queryKey: ['allUsers'],
    queryFn: getUsersAsync,
  });

  const handleChange = (event: SelectChangeEvent) => {
    setUser(event.target.value);
  };

  return (
    <Stack sx={STATS_PAGE_SX} spacing="3rem">
      {allUsersQuery.isError && <APIErrorToast />}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          maxWidth: '100%',
        }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            maxWidth: '100%',
          }}>
          <Typography variant="h5" gutterBottom sx={{ margin: '0' }}>
            Please select a user from the list:
          </Typography>

          <FormControl
            variant="standard"
            sx={{
              minWidth: '200px',
            }}>
            <Select variant="standard" value={user} onChange={handleChange}>
              {allUsersQuery.data?.map((user, index) => (
                <MenuItem value={user.id} key={index}>
                  {`${user.name} (${user.email})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {user !== '' && (
          <ExportStatistics
            getData={() => getUserStatisticsExportAsync(user, from, to)}
          />
        )}
      </Box>

      {user !== '' && (
        <Box>
          <Divider sx={{ ...DIVIDER_SX, marginBottom: '2rem' }} />
          <StatisticDashboard statsQuery={userStatsQuery} />
        </Box>
      )}
    </Stack>
  );
};

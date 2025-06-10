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

import { getUserStatisticsExportAsync, getVHTsAsync } from 'src/shared/api';
import { UserRoleEnum } from 'src/shared/enums';
import {
  DIVIDER_SX,
  FORM_CTRL_SX,
  STATS_PAGE_SX,
} from './utils/statisticStyles';
import { StatisticDashboard } from './utils/StatisticsDashboard';
import { ExportStatistics } from './utils/ExportStatistics';
import { useUserStatsQuery } from './utils/queries';
import { useCurrentUser } from 'src/shared/hooks/auth/useCurrentUser';

type Props = {
  from: number;
  to: number;
};

export const VHTStatistics = ({ from, to }: Props) => {
  const currentUser = useCurrentUser();

  const [vht, setVht] = useState('');

  const vhtStatsQuery = useUserStatsQuery(vht, from, to);
  const allVHTsQuery = useQuery({
    queryKey: ['allVHTs'],
    queryFn: getVHTsAsync,
    select: (data) => {
      if (currentUser?.role === UserRoleEnum.CHO) {
        return data.filter((vht) =>
          currentUser.supervises.includes(vht.userId)
        );
      }
      return data;
    },
  });

  if (
    currentUser &&
    currentUser.role === UserRoleEnum.CHO &&
    currentUser.supervises.length === 0
  ) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          There are no VHTs under your supervision.
        </Typography>
      </Box>
    );
  }

  const handleChange = (event: SelectChangeEvent) => {
    setVht(event.target.value);
  };

  return (
    <Box sx={STATS_PAGE_SX}>
      <Stack spacing="2rem">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Typography variant="h5" gutterBottom>
            Please select a VHT from the list:
          </Typography>
          {vht !== '' && (
            <ExportStatistics
              getData={() => getUserStatisticsExportAsync(vht, from, to)}
            />
          )}
        </Box>

        <FormControl variant="standard" sx={FORM_CTRL_SX}>
          <Select variant="standard" value={vht} onChange={handleChange}>
            {allVHTsQuery.data?.map((vht, index) => (
              <MenuItem value={vht.userId} key={index}>
                {vht?.name ?? 'Unknown'} ({vht?.email ?? 'Unknown'})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {vht !== '' && (
          <>
            <Divider sx={DIVIDER_SX} />
            <StatisticDashboard statsQuery={vhtStatsQuery} />
          </>
        )}
      </Stack>
    </Box>
  );
};

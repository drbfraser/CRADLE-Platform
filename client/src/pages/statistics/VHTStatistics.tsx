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

import { getVHTsAsync } from 'src/shared/api/api';
import { getUserStatisticsExportAsync } from 'src/shared/api/apiStatistics';
import { UserRoleEnum } from 'src/shared/enums';
import {
  DIVIDER_SX,
  FORM_CTRL_SX,
  STATS_PAGE_SX,
} from './utils/statisticStyles';
import { StatisticDashboard } from './utils/StatisticsDashboard';
import { ExportStatistics } from './utils/ExportStatistics';
import { useUserStatsQuery } from './utils/queries';
import { selectCurrentUser } from 'src/redux/user-state';
import { useAppSelector } from 'src/shared/hooks';

type Props = {
  from: number;
  to: number;
};

export const VHTStatistics = ({ from, to }: Props) => {
  const user = useAppSelector(selectCurrentUser);

  const [vht, setVht] = useState('');

  const vhtStatsQuery = useUserStatsQuery(vht, from, to);
  const allVHTsQuery = useQuery({
    queryKey: ['allVHTs'],
    queryFn: getVHTsAsync,
    select: (data) => {
      if (user?.role === UserRoleEnum.CHO) {
        return data.filter((vht) => user.supervises.includes(vht.userId));
      }
      return data;
    },
  });

  if (user && user.role === UserRoleEnum.CHO && user.supervises.length === 0) {
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

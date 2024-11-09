import { UserWithToken, OrNull } from 'src/shared/types';
import {
  getUserStatisticsAsync,
  getUserStatisticsExportAsync,
} from 'src/shared/api/api';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ExportStatistics } from './utils/ExportStatistics';
import { ReduxState } from 'src/redux/reducers';
import { StatisticDashboard } from './utils/StatisticsInfo';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { DIVIDER_SX, STATS_PAGE_SX } from './utils/statisticStyles';

type MyStatisticsProps = {
  from: number;
  to: number;
};

type User = {
  user: OrNull<UserWithToken>;
};

export const MyStatistics = ({ from, to }: MyStatisticsProps) => {
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );
  const userId = user?.id;
  return (
    <Box sx={STATS_PAGE_SX}>
      <Box sx={{ float: 'left' }}>
        <Typography variant="h5" gutterBottom>
          During this period, you have assessed:
        </Typography>
      </Box>
      <Box sx={{ float: 'right' }}>
        {userId && (
          <ExportStatistics
            getData={() =>
              getUserStatisticsExportAsync(userId.toString(), from, to)
            }
          />
        )}
      </Box>

      <br />
      <br />

      <Divider sx={DIVIDER_SX} />
      <br />
      {userId && (
        <StatisticDashboard
          getData={() => getUserStatisticsAsync(userId.toString(), from, to)}
        />
      )}
    </Box>
  );
};

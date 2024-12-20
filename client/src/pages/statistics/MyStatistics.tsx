import {
  getUserStatisticsAsync,
  getUserStatisticsExportAsync,
} from 'src/shared/api/api';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ExportStatistics } from './utils/ExportStatistics';
import { StatisticDashboard } from './utils/StatisticsInfo';
import Typography from '@mui/material/Typography';
import { DIVIDER_SX, STATS_PAGE_SX } from './utils/statisticStyles';
import { useAppSelector } from 'src/shared/hooks';
import { selectCurrentUser } from 'src/redux/reducers/user/currentUser';

type MyStatisticsProps = {
  from: number;
  to: number;
};

export const MyStatistics = ({ from, to }: MyStatisticsProps) => {
  const { data: currentUser } = useAppSelector(selectCurrentUser);
  const userId = currentUser?.id;
  return (
    <Box sx={STATS_PAGE_SX}>
      <Box sx={{ float: 'left' }}>
        <Typography variant={'h5'} component={'h5'} gutterBottom>
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

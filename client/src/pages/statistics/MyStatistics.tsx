import { IUserWithTokens, OrNull } from 'src/shared/types';
import {
  getUserStatisticsAsync,
  getUserStatisticsExportAsync,
} from 'src/shared/api';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ExportStatistics } from './utils/ExportStatistics';
import { ReduxState } from 'src/redux/reducers';
import { StatisticDashboard } from './utils/StatisticDashboard';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { useStatisticsStyles } from './utils/statisticStyles';

interface IProps {
  from: number;
  to: number;
}

type User = {
  user: OrNull<IUserWithTokens>;
};

export const MyStatistics: React.FC<IProps> = ({ from, to }) => {
  const classes = useStatisticsStyles();
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );
  const userId = user?.userId;

  return (
    <div>
      <Box className={classes.floatLeft}>
        <Typography variant="h5" gutterBottom>
          During this period, you have assessed:
        </Typography>
      </Box>
      <Box className={classes.floatRight}>
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

      <Divider className={classes.divider} />
      <br />
      {userId && (
        <StatisticDashboard
          getData={() => getUserStatisticsAsync(userId.toString(), from, to)}
        />
      )}
    </div>
  );
};

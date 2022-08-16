import Divider from '@mui/material/Divider';
import { StatisticDashboard } from './utils/StatisticDashboard';
import Typography from '@mui/material/Typography';
import { getAllStatisticsAsync } from 'src/shared/api';
import { useStatisticsStyles } from './utils/statisticStyles';

interface IProps {
  from: number;
  to: number;
}

export const AllStatistics: React.FC<IProps> = ({ from, to }) => {
  const classes = useStatisticsStyles();

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        During this period, all users and facilities have assessed:
      </Typography>
      <Divider className={classes.divider} />
      <br />
      <StatisticDashboard getData={() => getAllStatisticsAsync(from, to)} />
    </div>
  );
};

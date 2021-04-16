import React, { useState } from 'react';
import { useEffect } from 'react';
import { IUser } from 'src/types';
import { Toast } from 'src/shared/components/toast';
import { StatisticDashboard } from './utils/StatisticDashboard';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { getAllUsers } from './utils';
import { useStatisticsStyles } from './utils/statisticStyles';
import FormControl from '@material-ui/core/FormControl';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import { ExportStatistics } from './utils/ExportStatistics';

interface IProps {
  from: number;
  to: number;
}

export const UserStatistics: React.FC<IProps> = ({ from, to }) => {
  const classes = useStatisticsStyles();
  const [users, setUsers] = useState<IUser[]>([]);
  const [user, setUser] = useState('');
  const [errorLoading, setErrorLoading] = useState(false);

  const handleChange = (event: any) => {
    setUser(event.target.value);
  };

  useEffect(() => {
    getAllUsers()
      .then((response) => {
        setUsers(response);
      })
      .catch((err) => {
        setErrorLoading(true);
      });
  }, []);

  return (
    <div>
      {errorLoading && (
        <Toast
          severity="error"
          message="Something went wrong loading the all VHT information. Please try again."
          open={errorLoading}
          onClose={() => setErrorLoading(false)}
        />
      )}
      <Box className={classes.floatLeft}>
        <Typography variant="h5" gutterBottom>
          Please select a user from the list:
        </Typography>
      </Box>
      <Box className={classes.floatRight}>
        {user !== '' && (
          <ExportStatistics
            url={
              BASE_URL +
              EndpointEnum.STATS_USER_EXPORT +
              `/${user}?from=${from}&to=${to}`
            }
          />
        )}
      </Box>

      <FormControl className={classes.formControl}>
        <Select value={user} onChange={handleChange}>
          {users.map((user, idx) => (
            <MenuItem value={user.userId} key={idx}>
              {`${user.firstName} (${user.email})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <br />
      <br />

      {user !== '' && (
        <div>
          <Divider className={classes.divider} />
          <br />
          <StatisticDashboard
            url={
              BASE_URL +
              EndpointEnum.STATS_USER +
              `/${user}?from=${from!}&to=${to!}`
            }
          />
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useEffect } from 'react';
import { IUser } from 'src/types';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { StatisticDashboard } from './utils/StatisticDashboard';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { useStatisticsStyles } from './utils/statisticStyles';
import FormControl from '@material-ui/core/FormControl';
import { apiFetch } from 'src/shared/utils/api';
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
    const getAllUsers = async () => {
      try {
        const response: IUser[] = await (
          await apiFetch(BASE_URL + EndpointEnum.USER_ALL)
        ).json();
        setUsers(response);
      } catch (e) {
        setErrorLoading(true);
      }
    };
    getAllUsers();
  }, []);

  return (
    <div>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
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
              `/${user}?from=${from}&to=${to}`
            }
          />
        </div>
      )}
    </div>
  );
};

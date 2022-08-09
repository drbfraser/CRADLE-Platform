import React, { useState } from 'react';
import {
  getUserStatisticsAsync,
  getUserStatisticsExportAsync,
  getUsersAsync,
} from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ExportStatistics } from './utils/ExportStatistics';
import FormControl from '@mui/material/FormControl';
import { IUser } from 'src/shared/types';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { StatisticDashboard } from './utils/StatisticDashboard';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useStatisticsStyles } from './utils/statisticStyles';

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
        setUsers(await getUsersAsync());
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
            getData={() => getUserStatisticsExportAsync(user, from, to)}
          />
        )}
      </Box>

      <FormControl variant="standard" className={classes.formControl}>
        <Select variant="standard" value={user} onChange={handleChange}>
          {users.map((user, idx) => (
            <MenuItem value={user.userId} key={idx}>
              {`${user.firstName} (${user.email})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <br />

      {user !== '' && (
        <div>
          <Divider className={classes.divider} />
          <br />
          <StatisticDashboard
            getData={() => getUserStatisticsAsync(user, from, to)}
          />
        </div>
      )}
    </div>
  );
};

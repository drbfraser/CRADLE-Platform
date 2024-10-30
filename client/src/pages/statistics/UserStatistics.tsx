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
import { StatisticDashboard } from './utils/StatisticsInfo';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import {
  DIVIDER_SX,
  FORM_CTRL_SX,
  STATS_PAGE_SX,
} from './utils/statisticStyles';

interface IProps {
  from: number;
  to: number;
}

export const UserStatistics: React.FC<IProps> = ({ from, to }) => {
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
    <Box sx={STATS_PAGE_SX}>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />

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
              {users.map((user, idx) => (
                <MenuItem value={user.userId} key={idx}>
                  {`${user.firstName} (${user.email})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{}}>
          {user !== '' && (
            <ExportStatistics
              getData={() => getUserStatisticsExportAsync(user, from, to)}
            />
          )}
        </Box>
      </Box>
      <br />

      {user !== '' && (
        <Box>
          <Divider sx={DIVIDER_SX} />
          <br />
          <StatisticDashboard
            getData={() => getUserStatisticsAsync(user, from, to)}
          />
        </Box>
      )}
    </Box>
  );
};

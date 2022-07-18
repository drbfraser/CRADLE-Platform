import { IUserWithTokens, OrNull } from 'src/shared/types';
import React, { useState } from 'react';
import {
  getUserStatisticsAsync,
  getUserStatisticsExportAsync,
} from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@material-ui/core/Box';
import { Divider } from '@material-ui/core';
import { ExportStatistics } from './utils/ExportStatistics';
import FormControl from '@material-ui/core/FormControl';
import { IVHT } from 'src/shared/types';
import MenuItem from '@material-ui/core/MenuItem';
import { ReduxState } from 'src/redux/reducers';
import Select from '@material-ui/core/Select';
import { StatisticDashboard } from './utils/StatisticDashboard';
import Typography from '@material-ui/core/Typography';
import { UserRoleEnum } from 'src/shared/enums';
import { getVHTsAsync } from 'src/shared/api';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useStatisticsStyles } from './utils/statisticStyles';

interface IProps {
  from: number;
  to: number;
}

type User = {
  user: OrNull<IUserWithTokens>;
};

export const VHTStatistics: React.FC<IProps> = ({ from, to }) => {
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );
  const classes = useStatisticsStyles();

  const [vhts, setVHTs] = useState<IVHT[]>([]);
  const [errorLoading, setErrorLoading] = useState(false);
  const [vht, setVht] = useState('');

  const handleChange = (event: any) => {
    setVht(event.target.value);
  };

  useEffect(() => {
    const getVHTs = async () => {
      try {
        let vhts = await getVHTsAsync();

        if (user && user.role === UserRoleEnum.CHO) {
          vhts = vhts.filter((vht) => user.supervises.includes(vht.userId));
        }

        setVHTs(vhts);
      } catch (e) {
        setErrorLoading(true);
      }
    };

    getVHTs();
  }, [user]);

  if (user && user.role === UserRoleEnum.CHO && user.supervises.length === 0) {
    return (
      <div>
        <Typography variant="h5" gutterBottom>
          There are no VHTs under your supervision.
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <div>
        <Box className={classes.floatLeft}>
          <Typography variant="h5" gutterBottom>
            Please select a VHT from the list:
          </Typography>
        </Box>
        <Box className={classes.floatRight}>
          {vht !== '' && (
            <ExportStatistics
              getData={() => getUserStatisticsExportAsync(vht, from, to)}
            />
          )}
        </Box>
        <FormControl className={classes.formControl}>
          <Select value={vht} onChange={handleChange}>
            {vhts.map((vht, idx) => (
              <MenuItem value={vht.userId} key={idx}>
                {vht?.firstName ?? 'Unknown'} ({vht?.email ?? 'Unknown'})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <br />
        ``
        {vht !== '' && (
          <div>
            <Divider className={classes.divider} />
            <StatisticDashboard
              getData={() => getUserStatisticsAsync(vht, from, to)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { useEffect } from 'react';
import { apiFetch } from 'src/shared/api';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { StatisticDashboard } from './utils/StatisticDashboard';
import { IVHT } from 'src/shared/types';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/shared/types';
import { UserRoleEnum } from 'src/shared/enums';
import FormControl from '@material-ui/core/FormControl';
import { API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { useStatisticsStyles } from './utils/statisticStyles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Divider } from '@material-ui/core';
import { ExportStatistics } from './utils/ExportStatistics';

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
        let theVHTs: IVHT[] = await (
          await apiFetch(API_URL + EndpointEnum.ALL_VHTS)
        ).json();

        if (user && user.role === UserRoleEnum.CHO) {
          theVHTs = theVHTs.filter((v) => user.supervises.includes(v.userId));
        }

        setVHTs(theVHTs);
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
              url={
                API_URL +
                EndpointEnum.STATS_USER_EXPORT +
                `/${vht}?from=${from}&to=${to}`
              }
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

        {vht !== '' && (
          <div>
            <Divider className={classes.divider} />
            <StatisticDashboard
              url={
                API_URL +
                EndpointEnum.STATS_USER +
                `/${vht}?from=${from}&to=${to}`
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

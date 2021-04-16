import React, { useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { useEffect } from 'react';
import { getAllVHT } from './utils/index';
import { Toast } from 'src/shared/components/toast';
import { StatisticDashboard } from './utils/StatisticDashboard';
import { IVHT } from 'src/types';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/types';
import { UserRoleEnum } from 'src/enums';
import FormControl from '@material-ui/core/FormControl';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';
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

  const supervisedVHTs = user!.supervises;
  const [vhts, setVhts] = useState<IVHT[]>([]);
  const [errorLoading, setErrorLoading] = useState(false);
  const [vht, setVht] = useState('');

  const handleChange = (event: any) => {
    setVht(event.target.value);
  };

  useEffect(() => {
    getAllVHT()
      .then((response) => {
        setVhts(response);
      })
      .catch((err) => {
        setErrorLoading(true);
      });
  }, []);

  return (
    <div>
      {errorLoading && (
        <Toast
          status="error"
          message="Something went wrong loading the all VHT information. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}
      {user?.role.includes(UserRoleEnum.CHO) &&
      (supervisedVHTs === undefined || supervisedVHTs.length === 0) ? (
        <Typography variant="h5" gutterBottom>
          There are no VHTs under your supervision.
        </Typography>
      ) : (
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
                  BASE_URL +
                  EndpointEnum.STATS_USER_EXPORT +
                  `/${vht}?from=${from}&to=${to}`
                }
              />
            )}
          </Box>

          {user?.role.includes(UserRoleEnum.CHO) ? (
            <FormControl className={classes.formControl}>
              <Select value={vht} onChange={handleChange}>
                {supervisedVHTs.map((vhtId, idx) => {
                  const vht = vhts.find((v) => v.userId === vhtId);
                  return (
                    <MenuItem value={vhtId} key={idx}>
                      {vht?.firstName ?? 'Unknown'} ({vht?.email ?? 'Unknown'})
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          ) : (
            <FormControl className={classes.formControl}>
              <Select value={vht} onChange={handleChange}>
                {vhts.map((vht, idx) => (
                  <MenuItem value={vht.userId} key={idx}>
                    {`${vht.firstName} (id: ${vht.userId})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <br />
          <br />
          {vht !== '' && (
            <div>
              <Divider className={classes.divider} />
              <StatisticDashboard
                url={
                  BASE_URL +
                  EndpointEnum.STATS_USER +
                  `/${vht}?from=${from!}&to=${to!}`
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

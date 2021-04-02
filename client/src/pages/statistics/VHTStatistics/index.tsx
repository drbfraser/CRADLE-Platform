import React, { useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { useEffect } from 'react';
import { getAllVHT } from '../utils';
import { Toast } from 'src/shared/components/toast';
import { StatisticDashboardWithSelect } from '../utils/StatisticDashboardWithSelect';
import { IVHT } from 'src/types';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/types';
import { Moment } from 'moment';
import { UserRoleEnum } from 'src/enums';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';

interface IProps {
  from: Moment;
  to: Moment;
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
  const classes = useStyles();

  const supervisedVHTs = user!.supervises;
  const [vhts, setVhts] = useState<IVHT[]>([]);
  const [errorLoading, setErrorLoading] = useState(false);
  const [vht, setVht] = useState();

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
        <h1>There are no VHTs under your supervision.</h1>
      ) : (
        <div>
          <h3>Please select a VHT from the list:</h3>

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
          {vht !== undefined && (
            <StatisticDashboardWithSelect
              url={
                BASE_URL +
                EndpointEnum.STATS_USER +
                `/${vht}?from=${from!.toDate().getTime() / 1000}&to=${
                  to!.toDate().getTime() / 1000
                }`
              }
              select={vht}
            />
          )}
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
}));

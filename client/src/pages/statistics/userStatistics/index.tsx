import React, { useState } from 'react';
import { useEffect } from 'react';
import { IUser } from 'src/types';
import { Toast } from 'src/shared/components/toast';
import { StatisticDashboardWithSelect } from '../utils/StatisticDashboardWithSelect';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { getAllUsers } from '../utils';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import { Moment } from 'moment';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';

interface IProps {
  from: Moment;
  to: Moment;
}

export const UserStatistics: React.FC<IProps> = ({ from, to }) => {
  const classes = useStyles();
  const [users, setUsers] = useState<IUser[]>([]);
  const [user, setUser] = useState();
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
          status="error"
          message="Something went wrong loading the all VHT information. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}
      <div>
        <h3>Please select a user from the list:</h3>

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
        {user !== undefined && (
          <StatisticDashboardWithSelect
            url={
              BASE_URL +
              EndpointEnum.STATS_USER +
              `/${user}?from=${from!.toDate().getTime() / 1000}&to=${
                to!.toDate().getTime() / 1000
              }`
            }
            select={user}
          />
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    flot: 'right',
    margin: theme.spacing(1),
    minWidth: 180,
  },
}));

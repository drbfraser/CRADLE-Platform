import React, { useState } from 'react';
import { useEffect } from 'react';
import { IUser } from 'src/types';
import { Toast } from 'src/shared/components/toast';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import {
  getAllUsers,
  getUserStatisticData,
  initialData,
  initialColorReading,
} from '../utils';

interface IProps {
  from: Date;
  to: Date;
}

export const AllUsers: React.FC<IProps> = ({ from, to }) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [data, setData] = useState(initialData);
  const [colorReading, setColorReading] = useState(initialColorReading);
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

  useEffect(() => {
    if (user !== undefined) {
      getUserStatisticData(user, from.getTime() / 1000, to.getTime() / 1000)
        .then((response) => {
          setData(response);
          setColorReading(response);
          setLoading(true);
        })
        .catch((err) => {
          setErrorLoading(true);
        });
    }
  }, [user, from, to]);

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

        <Select value={user} onChange={handleChange}>
          {users.map((user, idx) => (
            <MenuItem value={user.userId} key={idx}>
              {`${user.firstName} (id: ${user.userId})`}
            </MenuItem>
          ))}
        </Select>
        <br />
        <br />

        {user !== undefined && loading && (
          <StatisticDashboard data={data} colorReading={colorReading} />
        )}
      </div>
    </div>
  );
};

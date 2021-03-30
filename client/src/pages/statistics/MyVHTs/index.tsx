import React, { useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { useEffect } from 'react';
import { getAllVHT } from '../utils';
import { Toast } from 'src/shared/components/toast';
import { StatisticDashboardWithSelect } from '../utils/StatisticDashboardWithSelect';
import { IVHT } from 'src/types';
import { getUserStatisticData } from '../utils';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/types';

interface IProps {
  from: Date;
  to: Date;
}

type User = {
  user: OrNull<IUserWithTokens>;
};

export const MyVHTs: React.FC<IProps> = ({ from, to }) => {
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );

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
      {supervisedVHTs === undefined || supervisedVHTs.length === 0 ? (
        <h1>There are no VHTs under your supervision.</h1>
      ) : (
        <div>
          <h3>Please select a VHT from the list:</h3>
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
          <br />
          <br />
          {vht !== undefined && (
            <StatisticDashboardWithSelect
              getData={() =>
                getUserStatisticData(
                  vht,
                  from.getTime() / 1000,
                  to.getTime() / 1000
                )
              }
              select={vht}
              message={
                'Something went wrong loading VHT statistics. Please try again.'
              }
              from={from}
              to={to}
            />
          )}
        </div>
      )}
    </div>
  );
};

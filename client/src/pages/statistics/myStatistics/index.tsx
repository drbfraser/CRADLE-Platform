import { getUserStatisticData } from '../utils';
import React from 'react';
import { StatisticDashboard } from '../utils/StatisticDashboard';
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

export const MyStatistics: React.FC<IProps> = ({ from, to }) => {
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );

  return (
    <div>
      <h3>During this period, you have assessed:</h3>
      <br />
      <br />

      <StatisticDashboard
        getData={() =>
          getUserStatisticData(
            user!.userId,
            from.getTime() / 1000,
            to.getTime() / 1000
          )
        }
        message={
          'Something went wrong loading user statistics. Please try again.'
        }
        from={from}
        to={to}
      />
    </div>
  );
};

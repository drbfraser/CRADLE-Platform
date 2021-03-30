import { getFacilitiesData } from '../utils';
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

export const MyFacility: React.FC<IProps> = ({ from, to }) => {
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );
  const facilityName = user!.healthFacilityName;

  return (
    <div>
      <h1>During this period, your facility has assessed:</h1>
      <StatisticDashboard
        getData={() =>
          getFacilitiesData(
            facilityName,
            from.getTime() / 1000,
            to.getTime() / 1000
          )
        }
        message={
          'Something went wrong loading the health care facilities. Please try again.'
        }
        from={from}
        to={to}
      />
    </div>
  );
};

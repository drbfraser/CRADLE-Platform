import React from 'react';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/types';
import { Moment } from 'moment';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';

interface IProps {
  from: Moment;
  to: Moment;
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
      <h3>During this period, your facility has assessed:</h3>
      <StatisticDashboard
        url={
          BASE_URL +
          EndpointEnum.STATS_FACILITY +
          `/${facilityName}?from=${from!.toDate().getTime() / 1000}&to=${
            to!.toDate().getTime() / 1000
          }`
        }
      />
    </div>
  );
};

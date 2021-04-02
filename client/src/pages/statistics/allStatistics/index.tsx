import React from 'react';
import { StatisticDashboard } from '../utils/StatisticDashboard';
import { Moment } from 'moment';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';

interface IProps {
  from: Moment;
  to: Moment;
}

export const AllStatistics: React.FC<IProps> = ({ from, to }) => {
  return (
    <div>
      <h3>During this period, users and facilities have assessed:</h3>
      <br />
      <br />
      <StatisticDashboard
        url={
          BASE_URL +
          EndpointEnum.STATS_ALL +
          `?from=${from!.toDate().getTime() / 1000}&to=${
            to!.toDate().getTime() / 1000
          }`
        }
      />
    </div>
  );
};

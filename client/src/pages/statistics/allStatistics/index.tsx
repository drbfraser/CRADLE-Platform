import { getAllUserAndFacilitiesData } from '../utils';
import React from 'react';
import { StatisticDashboard } from '../utils/StatisticDashboard';

interface IProps {
  from: Date;
  to: Date;
}

export const AllStatistics: React.FC<IProps> = ({ from, to }) => {
  return (
    <div>
      <h3>During this period, users and facilities have assessed:</h3>
      <br />
      <br />
      <StatisticDashboard
        getData={() =>
          getAllUserAndFacilitiesData(
            from.getTime() / 1000,
            to.getTime() / 1000
          )
        }
        message={
          'Something went wrong loading all users and health care facilities statistics. Please try again.'
        }
        from={from}
        to={to}
      />
    </div>
  );
};

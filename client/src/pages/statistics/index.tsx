import React from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import moment from 'moment';
import { MyStatistics } from './myStatistics';
import { VHTStatistics } from './VHTStatistics';
import { IUserWithTokens, OrNull } from 'src/types';
import { UserRoleEnum } from 'src/enums';
import { MyFacility } from './myFacility';
import { AllStatistics } from './allStatistics';
import { AllUsers } from './allUsers';
import { AllFacilities } from './allFacilities';
import { Toast } from 'src/shared/components/toast';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';

import { useState } from 'react';
import { RangeType } from 'rsuite/lib/DateRangePicker';
import { AllVHTs } from './allVHTs';
import { Tab } from 'semantic-ui-react';

type User = {
  user: OrNull<IUserWithTokens>;
};

export default function NewStatistics() {
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );

  const [errorLoading, setErrorLoading] = useState(false);

  const allPanes = [
    {
      name: 'My Statistics',
      Component: MyStatistics,
      roles: [
        UserRoleEnum.VHT,
        UserRoleEnum.CHO,
        UserRoleEnum.HCW,
        UserRoleEnum.ADMIN,
      ],
    },
    {
      name: 'My VHTs',
      Component: VHTStatistics,
      roles: [UserRoleEnum.CHO],
    },
    {
      name: 'VHT Statistics',
      Component: AllVHTs,
      roles: [UserRoleEnum.HCW],
    },
    {
      name: 'My Facility',
      Component: MyFacility,
      roles: [UserRoleEnum.HCW],
    },
    {
      name: 'User Statistics',
      Component: AllUsers,
      roles: [UserRoleEnum.ADMIN],
    },
    {
      name: 'Facility Statistics',
      Component: AllFacilities,
      roles: [UserRoleEnum.ADMIN],
    },
    {
      name: 'All Users and Facilities',
      Component: AllStatistics,
      roles: [UserRoleEnum.ADMIN],
    },
  ];

  const panes = allPanes
    .filter((p) => p?.roles.includes(user!.role))
    .map((p) => ({
      menuItem: p.name,
      render: () => (
        <Tab.Pane>
          <p.Component from={dateRange[0]} to={dateRange[1]} />
        </Tab.Pane>
      ),
    }));

  const customDateRanges: RangeType[] = [
    {
      label: 'This Week',
      value: [
        moment().startOf('day').subtract(6, 'days').toDate(),
        moment().endOf('day').toDate(),
      ],
    },
    {
      label: 'Last Week',
      value: [
        moment().startOf('day').subtract(13, 'days').toDate(),
        moment().endOf('day').subtract(7, 'days').toDate(),
      ],
    },
    {
      label: 'Last 14 Days',
      value: [
        moment().startOf('day').subtract(13, 'days').toDate(),
        moment().endOf('day').toDate(),
      ],
    },
    {
      label: 'Last 30 Days',
      value: [
        moment().startOf('day').subtract(29, 'days').toDate(),
        moment().endOf('day').toDate(),
      ],
    },
  ];

  const [dateRange, setDateRange] = useState([
    moment().startOf('day').subtract(29, 'days').toDate(),
    moment().endOf('day').toDate(),
  ]);

  function handleDateRangeChange(value: any) {
    setDateRange(value);
  }

  return (
    <div>
      {errorLoading && (
        <Toast
          status="error"
          message="Something went wrong loading all user lists. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}

      <DateRangePicker
        size="lg"
        value={[dateRange[0], dateRange[1]]}
        onChange={handleDateRangeChange}
        ranges={customDateRanges}
      />
      <br />
      <br />
      <Tab panes={panes} />
    </div>
  );
}

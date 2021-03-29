import React from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { MyStatistics } from './myStatistics';
import { VHTStatistics } from './VHTStatistics';
import { IUserWithTokens, OrNull } from 'src/types';
import { UserRoleEnum } from 'src/enums';
import { FacilityStatistics } from './facilityStatistics';
import { AllStatistics } from './allStatistics';
import { AllUsers } from './allUsers';
import { AllFacilities } from './allFacilities';
import { Toast } from 'src/shared/components/toast';

import { startOfDay, endOfDay, subDays } from 'date-fns';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';

import { useState } from 'react';
import { RangeType } from 'rsuite/lib/DateRangePicker';
import { AllVHTs } from './allVHTs.tsx';

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

  const isCHO = user?.role === UserRoleEnum.CHO;
  const isHWC = user?.role === UserRoleEnum.HCW;
  const isADMIN = user?.role === UserRoleEnum.ADMIN;
  const userId = user?.userId;
  const myFacilityName = user?.healthFacilityName;
  const supervisedVHTs = user?.supervises;

  const customDateRanges: RangeType[] = [
    {
      label: 'This Week',
      value: [startOfDay(subDays(new Date(), 6)), endOfDay(new Date())],
    },
    {
      label: 'Last Week',
      value: [
        startOfDay(subDays(new Date(), 13)),
        endOfDay(subDays(new Date(), 7)),
      ],
    },
    {
      label: 'Last 14 Days',
      value: [startOfDay(subDays(new Date(), 13)), endOfDay(new Date())],
    },
    {
      label: 'Last 30 Days',
      value: [startOfDay(subDays(new Date(), 29)), endOfDay(new Date())],
    },
  ];

  const [dateRange, setDateRange] = useState([
    subDays(new Date(), 30),
    new Date(),
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
      <Tabs>
        <TabList>
          <Tab>My Statistics</Tab>
          {isCHO && <Tab>My VHTs</Tab>}
          {isHWC && <Tab>All VHTs</Tab>}
          {isHWC && <Tab>My Facility</Tab>}
          {isADMIN && <Tab>All Users</Tab>}
          {isADMIN && <Tab>All Facilities</Tab>}
          {isADMIN && <Tab>All Users and Facilities</Tab>}
        </TabList>

        <TabPanel>
          <MyStatistics userId={userId} from={dateRange[0]} to={dateRange[1]} />
        </TabPanel>

        {isCHO && (
          <TabPanel>
            <VHTStatistics
              supervisedVHTs={supervisedVHTs}
              from={dateRange[0]}
              to={dateRange[1]}
            />
          </TabPanel>
        )}

        {isHWC && (
          <TabPanel>
            <AllVHTs from={dateRange[0]} to={dateRange[1]} />
          </TabPanel>
        )}

        {isHWC && (
          <TabPanel>
            <FacilityStatistics
              facilityName={myFacilityName}
              from={dateRange[0]}
              to={dateRange[1]}
            />
          </TabPanel>
        )}

        {isADMIN && (
          <TabPanel>
            <AllUsers from={dateRange[0]} to={dateRange[1]} />
          </TabPanel>
        )}

        {isADMIN && (
          <TabPanel>
            <AllFacilities from={dateRange[0]} to={dateRange[1]} />
          </TabPanel>
        )}

        {isADMIN && (
          <TabPanel>
            <AllStatistics from={dateRange[0]} to={dateRange[1]} />
          </TabPanel>
        )}
      </Tabs>
    </div>
  );
}

import React from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { MyStatistics } from './myStatistics';
import VHTStatistics from './VHTStatistics';
import { ActualUser, OrNull } from 'src/types';
import { RoleEnum } from 'src/enums';
import FacilityStatistics from './facilityStatistics';
import { AllStatistics } from './allStatistics';
import AllVHTStatistics from './allVHTStatistics';
import { useEffect } from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Grid from '@material-ui/core/Grid';
import { useState } from 'react';

type User = {
  user: OrNull<ActualUser>;
};

export default function NewStatistics() {
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );

  const [startDate, setStartDate] = useState(new Date('2021/02/14'));

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    console.log(startDate);
  };

  const [endDate, setEndDate] = useState(new Date());

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    console.log(endDate);
  };

  const isCHO = user?.roles.includes(RoleEnum.CHO);
  const isHWC = user?.roles.includes(RoleEnum.HCW);
  const isADMIN = user?.roles.includes(RoleEnum.ADMIN);
  // const hasVHTList = !(user?.vhtList.length === 0 || user?.vhtList == null);

  useEffect(() => {
    console.log(user?.vhtList.length === 0);
    console.log(user);
  }, []);

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <h4>From</h4>
          <DatePicker
            dateFormat="dd/MM/yyyy"
            selected={startDate}
            onChange={handleStartDateChange}
          />
        </Grid>
        <Grid item xs={3}>
          <h4>To</h4>
          <DatePicker
            dateFormat="dd/MM/yyyy"
            selected={endDate}
            onChange={handleEndDateChange}
          />
        </Grid>
      </Grid>
      <Tabs>
        <TabList>
          <Tab>My Statistics</Tab>
          {(isHWC || isADMIN) && <Tab>My Facility</Tab>}
          {(isCHO || isADMIN) && <Tab>My VHTs</Tab>}
          {(isHWC || isADMIN) && <Tab>All VHTs</Tab>}
          {isADMIN && <Tab>All Users and Facilities</Tab>}
        </TabList>

        <TabPanel>
          <MyStatistics from={startDate} to={endDate} />
        </TabPanel>
        <TabPanel>{(isHWC || isADMIN) && <FacilityStatistics />}</TabPanel>
        <TabPanel>{(isCHO || isADMIN) && <VHTStatistics />}</TabPanel>
        <TabPanel>{(isHWC || isADMIN) && <AllVHTStatistics />}</TabPanel>
        <TabPanel>{isADMIN && <AllStatistics isAdmin={isADMIN} />}</TabPanel>
      </Tabs>
    </div>
  );
}

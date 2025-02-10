import moment from 'moment';

import { AllStatistics } from './AllStatistics';
import { FacilityStatistics } from './FacilityStatistics';
import { MyFacility } from './MyFacility';
import { MyStatistics } from './MyStatistics';
import { ReduxState } from 'src/redux/reducers';
import { UserRoleEnum } from 'src/shared/enums';
import { UserStatistics } from './UserStatistics';
import { VHTStatistics } from './VHTStatistics';
import { useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { useDateRangeState } from 'src/shared/components/Date/useDateRangeState';
import { DateRangePickerWithPreset } from 'src/shared/components/Date/DateRangePicker';
import { Tabs } from 'src/shared/components/Tabs/Tabs';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { DASHBOARD_PADDING } from 'src/shared/constants';

export function StatisticsPage() {
  const user = useSelector((state: ReduxState) => state.user.current.data);

  const dateRangeState = useDateRangeState();
  const { startDate, setStartDate, endDate, setEndDate } = dateRangeState;

  // Set initial date range as the previous month.
  useEffect(() => {
    setStartDate(moment().endOf('day').subtract(1, 'month'));
    setEndDate(moment().endOf('day'));
  }, [setEndDate, setStartDate]);

  const from = useMemo(
    () => Math.trunc(startDate ? startDate.toDate().getTime() / 1000 : 0),
    [startDate]
  );
  const to = useMemo(
    () => Math.trunc(endDate ? endDate.toDate().getTime() / 1000 : 0),
    [endDate]
  );
  const range = {
    from,
    to,
  };
  const allPanels = [
    {
      label: 'My Statistics',
      Component: () => <MyStatistics {...range} />,
      roles: [
        UserRoleEnum.VHT,
        UserRoleEnum.CHO,
        UserRoleEnum.HCW,
        UserRoleEnum.ADMIN,
      ],
    },
    {
      label: 'My VHTs',
      Component: () => <VHTStatistics {...range} />,
      roles: [
        UserRoleEnum.CHO,
        UserRoleEnum.ADMIN, // for testing only. Remove after
      ],
    },
    {
      label: 'VHT Statistics',
      Component: () => <VHTStatistics {...range} />,
      roles: [
        UserRoleEnum.HCW,
        UserRoleEnum.ADMIN, // for testing only. Remove after
      ],
    },
    {
      label: 'My Facility',
      Component: () => <MyFacility {...range} />,
      roles: [
        UserRoleEnum.HCW,
        UserRoleEnum.ADMIN, // for testing only. Remove after
      ],
    },
    {
      label: 'User Statistics',
      Component: () => <UserStatistics {...range} />,
      roles: [UserRoleEnum.ADMIN],
    },
    {
      label: 'Facility Statistics',
      Component: () => <FacilityStatistics {...range} />,
      roles: [UserRoleEnum.ADMIN],
    },
    {
      label: 'All Users and Facilities',
      Component: () => <AllStatistics {...range} />,
      roles: [UserRoleEnum.ADMIN],
    },
  ];

  const panels = allPanels.filter((panel) => panel.roles.includes(user!.role));

  return (
    <Box
      sx={{
        maxWidth: '100%',
        width: '100%',
        height: '100%',
        resize: 'both',
      }}>
      <DashboardPaper>
        <Box
          id="statistics-container"
          sx={{
            marginBottom: '10px',
            display: 'flex',
            flexDirection: 'column',
            padding: DASHBOARD_PADDING,
          }}>
          <DateRangePickerWithPreset {...dateRangeState} />
          <Box sx={{ marginTop: '1rem', marginBottom: '2rem' }}>
            <Tabs panels={panels} />
          </Box>
        </Box>
      </DashboardPaper>
    </Box>
  );
}

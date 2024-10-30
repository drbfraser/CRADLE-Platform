import moment from 'moment';

import { AllStatistics } from './AllStatistics';
import { FacilityStatistics } from './FacilityStatistics';
import { MyFacility } from './MyFacility';
import { MyStatistics } from './MyStatistics';
import { ReduxState } from 'src/redux/reducers';
import { Toast } from 'src/shared/components/toast';
import { UserRoleEnum } from 'src/shared/enums';
import { UserStatistics } from './UserStatistics';
import { VHTStatistics } from './VHTStatistics';
import { useSelector } from 'react-redux';
import { useEffect, useState, PropsWithChildren, useMemo } from 'react';
import { Box } from '@mui/material';
import { useDateRangeState } from 'src/shared/components/Date/useDateRangeState';
import { DateRangePickerWithPreset } from 'src/shared/components/Date/DateRangePicker';
import { Tabs, Tab } from '@mui/material';

const allPanels = [
  {
    label: 'My Statistics',
    Component: MyStatistics,
    roles: [
      UserRoleEnum.VHT,
      UserRoleEnum.CHO,
      UserRoleEnum.HCW,
      UserRoleEnum.ADMIN,
    ],
  },
  {
    label: 'My VHTs',
    Component: VHTStatistics,
    roles: [UserRoleEnum.CHO],
  },
  {
    label: 'VHT Statistics',
    Component: VHTStatistics,
    roles: [UserRoleEnum.HCW],
  },
  {
    label: 'My Facility',
    Component: MyFacility,
    roles: [UserRoleEnum.HCW],
  },
  {
    label: 'User Statistics',
    Component: UserStatistics,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    label: 'Facility Statistics',
    Component: FacilityStatistics,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    label: 'All Users and Facilities',
    Component: AllStatistics,
    roles: [UserRoleEnum.ADMIN],
  },
];

export function StatisticsPage() {
  const user = useSelector((state: ReduxState) => state.user.current.data);

  const [errorLoading, setErrorLoading] = useState(false);
  const dateRangeState = useDateRangeState();
  const { startDate, setStartDate, endDate, setEndDate } = dateRangeState;
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Set initial date range as the previous month.
  useEffect(() => {
    setStartDate(moment().endOf('day').subtract(1, 'month'));
    setEndDate(moment().endOf('day'));
  }, []);

  const from = useMemo(() => startDate!.toDate().getTime() / 1000, []);
  const to = useMemo(() => endDate!.toDate().getTime() / 1000, []);

  const panels = allPanels.filter((panel) => panel?.roles.includes(user!.role));

  return (
    <Box
      sx={{
        maxWidth: '100%',
        width: '100%',
        height: '100%',
        resize: 'both',
      }}>
      {errorLoading && (
        <Toast
          severity="error"
          message="Something went wrong loading all user lists. Please try again."
          open={errorLoading}
          onClose={() => setErrorLoading(false)}
        />
      )}

      <Box
        id={'statistics-container'}
        sx={{ marginBottom: '10px', display: 'flex', flexDirection: 'column' }}>
        <DateRangePickerWithPreset {...dateRangeState} />
        <Tabs
          sx={{ marginTop: '1rem' }}
          value={activeTabIndex}
          onChange={(_event, newValue) => setActiveTabIndex(newValue)}>
          {panels.map((panel) => (
            <Tab label={panel.label} key={panel.label} />
          ))}
        </Tabs>
        {panels.map((panel, index) => (
          <StatisticsTabPanel
            index={index}
            activeTabIndex={activeTabIndex}
            key={panel.label}>
            <panel.Component from={from} to={to} />
          </StatisticsTabPanel>
        ))}
      </Box>
    </Box>
  );
}

type StatisticsTabPanelProps = PropsWithChildren & {
  index: number;
  activeTabIndex: number;
};
const StatisticsTabPanel = ({
  children,
  index,
  activeTabIndex,
}: StatisticsTabPanelProps) => {
  return index === activeTabIndex ? <>{children}</> : null;
};

import moment, { Moment } from 'moment';

import { AllStatistics } from './AllStatistics';
import { FacilityStatistics } from './FacilityStatistics';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { MyFacility } from './MyFacility';
import { MyStatistics } from './MyStatistics';
import { ReduxState } from 'src/redux/reducers';
import Select from '@mui/material/Select';
import { Tab } from 'semantic-ui-react';
import { Toast } from 'src/shared/components/toast';
import { UserRoleEnum } from 'src/shared/enums';
import { UserStatistics } from './UserStatistics';
import { VHTStatistics } from './VHTStatistics';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { FORM_CTRL_SX, TAB_SX } from './utils/statisticStyles';
import { Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useDateRangeState } from 'src/shared/components/Date/useDateRangeState';
import { DateRangePickerWithPreset } from 'src/shared/components/Date/DateRangePicker';

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
    Component: VHTStatistics,
    roles: [UserRoleEnum.HCW],
  },
  {
    name: 'My Facility',
    Component: MyFacility,
    roles: [UserRoleEnum.HCW],
  },
  {
    name: 'User Statistics',
    Component: UserStatistics,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    name: 'Facility Statistics',
    Component: FacilityStatistics,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    name: 'All Users and Facilities',
    Component: AllStatistics,
    roles: [UserRoleEnum.ADMIN],
  },
];

export function StatisticsPage() {
  const user = useSelector((state: ReduxState) => state.user.current.data);

  const [errorLoading, setErrorLoading] = useState(false);
  const dateRangeState = useDateRangeState();
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    presetDateRange,
    setPresetDateRange,
  } = dateRangeState;

  // Set initial date range as the previous month.
  useEffect(() => {
    setStartDate(moment().endOf('day').subtract(1, 'month'));
    setEndDate(moment().endOf('day'));
  }, []);

  const panes = allPanes
    .filter((p) => p?.roles.includes(user!.role))
    .map((p) => ({
      menuItem: p.name,
      render: () => (
        <Tab.Pane>
          {startDate && endDate && (
            <p.Component
              from={startDate.toDate().getTime() / 1000}
              to={endDate.toDate().getTime() / 1000}
            />
          )}
        </Tab.Pane>
      ),
    }));

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

      <Grid id={'statistics-container'} item sx={{ marginBottom: '10px' }}>
        <DateRangePickerWithPreset {...dateRangeState} />
        <Tab
          menu={{
            secondary: true,
            pointing: true,
            sx: TAB_SX,
          }}
          panes={panes}
        />
      </Grid>
    </Box>
  );
}

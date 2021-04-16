import React from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/types';
import { Toast } from 'src/shared/components/toast';
import { useState } from 'react';
import { Tab } from 'semantic-ui-react';
import moment, { Moment } from 'moment';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker, FocusedInputShape } from 'react-dates';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import { UserRoleEnum } from 'src/enums';
import { MyStatistics } from './MyStatistics';
import { VHTStatistics } from './VHTStatistics';
import { MyFacility } from './MyFacility';
import { AllStatistics } from './AllStatistics';
import { UserStatistics } from './UserStatistics';
import { FacilityStatistics } from './FacilityStatistics';
import { useStatisticsStyles } from './utils/statisticStyles';

type User = {
  user: OrNull<IUserWithTokens>;
};

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
  const classes = useStatisticsStyles();
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );

  const [errorLoading, setErrorLoading] = useState(false);
  const [startDate, setStartDate] = useState<Moment>(
    moment().startOf('day').subtract(29, 'days')
  );
  const [endDate, setEndDate] = useState<Moment>(moment().endOf('day'));
  const [focusedInput, setFocusedInput] = useState<FocusedInputShape | null>(
    null
  );
  const [presetDaterange, setPresetDaterange] = useState();

  const handleFocusChange = (arg: FocusedInputShape | null) => {
    setFocusedInput(arg);
  };

  const panes = allPanes
    .filter((p) => p?.roles.includes(user!.role))
    .map((p) => ({
      menuItem: p.name,
      render: () => (
        <Tab.Pane>
          {startDate && endDate && (
            <p.Component
              from={startDate?.toDate().getTime() / 1000}
              to={endDate?.toDate().getTime() / 1000}
            />
          )}
        </Tab.Pane>
      ),
    }));

  const handleChange = (event: any) => {
    setPresetDaterange(event.target.value);
  };

  const setDateRange = (start: number, end: number) => {
    setStartDate(moment().startOf('day').subtract(start, 'days'));
    setEndDate(moment().endOf('day').subtract(end, 'days'));
  };

  return (
    <div className={classes.root}>
      {errorLoading && (
        <Toast
          severity="error"
          message="Something went wrong loading all user lists. Please try again."
          open={errorLoading}
          onClose={() => setErrorLoading(false)}
        />
      )}

      <Grid item className={classes.floatLeft}>
        <DateRangePicker
          regular={true}
          startDate={startDate}
          startDateId="startDate"
          endDate={endDate}
          endDateId="endDate"
          onDatesChange={({ startDate, endDate }) => {
            setStartDate(startDate!);
            setEndDate(endDate!);
          }}
          readOnly
          focusedInput={focusedInput}
          onFocusChange={handleFocusChange}
          isOutsideRange={() => false}
        />
      </Grid>

      <Grid item className={classes.right}>
        <FormControl
          className={classes.formControl}
          size="small"
          variant="outlined">
          <InputLabel className={classes.inputLabel}>
            Preset date ranges
          </InputLabel>
          <Select
            value={presetDaterange ? presetDaterange : ''}
            onChange={handleChange}
            label="Preset date ranges">
            <MenuItem value={undefined} disabled></MenuItem>
            <MenuItem
              value="This Week"
              onClick={() => {
                setDateRange(6, 0);
              }}>
              This Week
            </MenuItem>
            <MenuItem
              value="Last Week"
              onClick={() => {
                setDateRange(13, 7);
              }}>
              Last Week
            </MenuItem>
            <MenuItem
              value="Last 14 Days"
              onClick={() => {
                setDateRange(13, 0);
              }}>
              Last 14 Days
            </MenuItem>
            <MenuItem
              value="Last 28 Days"
              onClick={() => {
                setDateRange(27, 0);
              }}>
              Last 28 Days
            </MenuItem>
          </Select>
        </FormControl>
        <br />
        <br />

        <Tab panes={panes} />
      </Grid>
    </div>
  );
}

import React from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/types';
import { AllPanes } from './utils';
import { Toast } from 'src/shared/components/toast';
import { makeStyles } from '@material-ui/core/styles';
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

type User = {
  user: OrNull<IUserWithTokens>;
};

export default function NewStatistics() {
  const classes = useStyles();
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

  const panes = AllPanes.filter((p) => p?.roles.includes(user!.role)).map(
    (p) => ({
      menuItem: p.name,
      render: () => (
        <Tab.Pane>
          <p.Component from={startDate} to={endDate} />
        </Tab.Pane>
      ),
    })
  );

  const handleChange = (event: any) => {
    setPresetDaterange(event.target.value);
  };

  return (
    <div className={classes.root}>
      {errorLoading && (
        <Toast
          status="error"
          message="Something went wrong loading all user lists. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}

      <Grid item className={classes.left}>
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
          focusedInput={focusedInput}
          onFocusChange={handleFocusChange}
          isOutsideRange={() => false}
        />
      </Grid>

      <Grid item className={classes.right}>
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.inputLabel}>
            Preset date ranges
          </InputLabel>
          <Select
            value={presetDaterange}
            onChange={handleChange}
            label="Please choose a preset date range">
            <MenuItem
              value="This Week"
              onClick={() => {
                setStartDate(moment().startOf('day').subtract(6, 'days'));
                setEndDate(moment().endOf('day'));
              }}>
              This Week
            </MenuItem>
            <MenuItem
              value="Last Week"
              onClick={() => {
                setStartDate(moment().startOf('day').subtract(13, 'days'));
                setEndDate(moment().endOf('day').subtract(7, 'days'));
              }}>
              Last Week
            </MenuItem>
            <MenuItem
              value="Last 14 Days"
              onClick={() => {
                setStartDate(moment().startOf('day').subtract(13, 'days'));
                setEndDate(moment().endOf('day'));
              }}>
              Last 14 Days
            </MenuItem>
            <MenuItem
              value="Last 28 Days"
              onClick={() => {
                setStartDate(moment().startOf('day').subtract(27, 'days'));
                setEndDate(moment().endOf('day'));
              }}>
              Last 28 Days
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <br />
      <br />

      <Tab panes={panes} />
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '95%',
    margin: 0,
    height: '100%',
    position: 'relative',
    resize: 'both',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
  left: {
    float: 'left',
    marginTop: '10px',
  },
  right: { margetLeft: '30px' },
  inputLabel: {
    fontSize: '50',
  },
}));

/**
 * This hook is intended to simplify the use of the DateRangePickerWithPreset
 * component, as the component requires passing in the state that it uses so
 * that the parent component will be able to use the state and reset it.
 */

import moment, { Moment } from 'moment';
import { useState } from 'react';
import {
  DateRangePreset,
  DateRangePickerWithPresetProps,
} from './DateRangePicker';

const createDate = () => moment();

export const useDateRangeState = () => {
  const [startDate, setStartDate] = useState<Moment | null>(createDate);
  const [endDate, setEndDate] = useState<Moment | null>(createDate);
  const [presetDateRange, setPresetDateRange] =
    useState<DateRangePreset | null>(null);

  const dateRangePickerProps: DateRangePickerWithPresetProps = {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    presetDateRange,
    setPresetDateRange,
  };
  return dateRangePickerProps;
};

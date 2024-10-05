import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { uniqueId } from 'lodash';
import moment, { Moment } from 'moment';
import { useState } from 'react';
import { SecondaryButton } from '../Button';

export type DateRangePreset = {
  label: string;
  id: string; // Unique Id.
  makeStartDate: () => Moment | null;
  makeEndDate: () => Moment | null;
};
export const DATE_RANGE_PRESETS: Map<string, DateRangePreset> = new Map<
  string,
  DateRangePreset
>([
  [
    'This Week',
    {
      label: 'This Week',
      id: uniqueId(),
      makeStartDate: () => moment().endOf('week').subtract(1, 'week'),
      makeEndDate: () => moment().endOf('day'),
    },
  ],
  [
    'Last Week',
    {
      label: 'Last Week',
      id: uniqueId(),
      makeStartDate: () => moment().endOf('week').subtract(2, 'weeks'),
      makeEndDate: () => moment().endOf('week').subtract(7, 'days'),
    },
  ],
  [
    'Last 14 Days',
    {
      label: 'Last 14 Days',
      id: uniqueId(),
      makeStartDate: () => moment().endOf('day').subtract(14, 'days'),
      makeEndDate: () => moment().endOf('day'),
    },
  ],
  [
    'Last 28 Days',
    {
      label: 'Last 28 Days',
      id: uniqueId(),
      makeStartDate: () => moment().endOf('day').subtract(28, 'days'),
      makeEndDate: () => moment().endOf('day'),
    },
  ],
]);

export type DateRangePickerWithPresetProps = {
  startDate: Moment | null;
  setStartDate: (newDate: Moment | null) => void;
  endDate: Moment | null;
  setEndDate: (newDate: Moment | null) => void;
  presetDateRange: DateRangePreset | null;
  setPresetDateRange: (newPreset: DateRangePreset | null) => void;
};
export const DateRangePickerWithPreset = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  presetDateRange,
  setPresetDateRange,
}: DateRangePickerWithPresetProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
      }}>
      <DatePicker
        sx={{
          width: '200px',
        }}
        name={'date-picker-start'}
        disableFuture
        value={startDate}
        onChange={setStartDate}
      />
      <DatePicker
        sx={{
          width: '200px',
        }}
        name={'date-picker-end'}
        disableFuture
        value={endDate}
        onChange={setEndDate}
      />
      <FormControl
        sx={{
          height: '56px',
          width: '180px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'end',
        }}
        size="medium"
        variant="filled">
        <InputLabel>Preset date ranges</InputLabel>
        <Select
          value={presetDateRange?.label ?? ''}
          onChange={(e) => {
            const key = e.target.value as string;
            if (!key) return;
            const preset = DATE_RANGE_PRESETS.get(key);
            if (!preset) return;
            setPresetDateRange(preset);
            setStartDate(preset.makeStartDate());
            setEndDate(preset.makeEndDate());
          }}
          label="Preset date ranges">
          {Array.from(DATE_RANGE_PRESETS.entries()).map(([label, preset]) => (
            <MenuItem value={label} key={preset.id}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <SecondaryButton
        onClick={() => {
          setStartDate(null);
          setEndDate(null);
          setPresetDateRange(null);
        }}>
        Clear
      </SecondaryButton>
    </Box>
  );
};

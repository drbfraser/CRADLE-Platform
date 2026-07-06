import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DateRangePickerWithPreset } from 'src/shared/components/Date/DateRangePicker';
import { FilterDialogState } from './types';

type Props = Pick<FilterDialogState, 'dateRangeState'>;

export const DateRangeFilterGroup = ({ dateRangeState }: Props) => (
  <Grid size={12}>
    <Typography variant="h4" component="h3">
      Date Range
    </Typography>
    <DateRangePickerWithPreset {...dateRangeState} clearButton />
  </Grid>
);

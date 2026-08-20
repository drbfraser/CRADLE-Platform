import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { Box, Divider, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { Filter, FilterRequestBody } from 'src/shared/types/filterTypes';
import { FlattenedRecord } from 'src/shared/types/types';
import { PatientRecordCard } from './PatientRecordCard';

const RECORD_FILTERS: Filter[] = [
  { parameter: 'referrals', display_title: 'Referral' },
  { parameter: 'readings', display_title: 'Reading' },
  { parameter: 'assessments', display_title: 'Assessment' },
  { parameter: 'forms', display_title: 'Form' },
];

type PatientRecordTimelineProps = {
  records: FlattenedRecord[];
  filterRequestBody: FilterRequestBody;
  onFilterChange: (filter: FilterRequestBody) => void;
};

export const PatientRecordTimeline = ({
  records,
  filterRequestBody,
  onFilterChange,
}: PatientRecordTimelineProps) => (
  <Paper
    sx={(theme) => ({
      width: '100%',
      padding: theme.spacing(2),
      marginTop: theme.spacing(2),
    })}>
    <Grid
      sx={{
        display: 'flex',
        placeContent: 'end',
        alignItems: 'center',
      }}>
      <Typography component="span">Show only: </Typography>
      {RECORD_FILTERS.map((filter) => (
        <FormControlLabel
          key={filter.parameter}
          control={
            <Checkbox
              checked={filterRequestBody[filter.parameter]}
              onChange={(e) => {
                onFilterChange({
                  ...filterRequestBody,
                  [filter.parameter]: e.target.checked,
                });
              }}
            />
          }
          label={filter.display_title}
        />
      ))}
    </Grid>

    <Divider />

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {records.map((record) => (
        <Grid key={record.id} size={{ xs: 12 }}>
          <PatientRecordCard record={record} />
        </Grid>
      ))}
    </Box>
  </Paper>
);

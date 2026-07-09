import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { FilterDialogState } from './types';

type Props = Pick<
  FilterDialogState,
  | 'referrersQuery'
  | 'selectedReferrers'
  | 'onReferrerSelect'
  | 'handleDeleteReferrerChip'
>;

export const ReferrerFilterGroup = ({
  referrersQuery,
  selectedReferrers,
  onReferrerSelect,
  handleDeleteReferrerChip,
}: Props) => (
  <Grid size={12}>
    <Typography variant="h4" component="h3">
      Referrer
    </Typography>
    <Autocomplete
      id="referrer-select"
      onChange={onReferrerSelect}
      options={referrersQuery.data ?? []}
      getOptionLabel={(referrer) =>
        `${referrer.firstName} - ${referrer.email} - ${referrer.healthFacilityName}`
      }
      renderInput={(params) => (
        <TextField {...params} label="Search Referrer" variant="outlined" />
      )}
    />
    <Box m={1.5} display="flex" flexWrap="wrap">
      {selectedReferrers.map((referrer, index) => (
        <Box mx={0.5} key={referrer.userId}>
          <Chip
            label={referrer.firstName}
            onDelete={() => handleDeleteReferrerChip(index)}
            color="primary"
          />
        </Box>
      ))}
    </Box>
  </Grid>
);

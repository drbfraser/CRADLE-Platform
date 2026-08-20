import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { FilterDialogState } from './types';

type Props = Pick<
  FilterDialogState,
  | 'healthFacilityNames'
  | 'selectedHealthFacilities'
  | 'onFacilitySelect'
  | 'handleDeleteFacilityChip'
>;

export const HealthFacilityFilterGroup = ({
  healthFacilityNames,
  selectedHealthFacilities,
  onFacilitySelect,
  handleDeleteFacilityChip,
}: Props) => (
  <Grid size={12}>
    <Typography variant="h4" component="h3">
      Health Facility
    </Typography>
    <Autocomplete
      id="facility-select"
      onChange={onFacilitySelect}
      options={healthFacilityNames}
      getOptionLabel={(facility) => facility}
      renderInput={(params) => (
        <TextField {...params} label="Search Facility" variant="outlined" />
      )}
    />
    <Box m={1.5} display="flex" flexWrap="wrap">
      {selectedHealthFacilities.map((facility, index) => (
        <Chip
          key={index}
          sx={{ mx: 0.5 }}
          label={facility}
          onDelete={() => handleDeleteFacilityChip(index)}
          color="primary"
        />
      ))}
    </Box>
  </Grid>
);

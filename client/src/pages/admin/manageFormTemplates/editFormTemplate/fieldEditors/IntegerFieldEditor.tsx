import { Grid, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import CustomNumberField from 'src/shared/components/Form/CustomNumberField';
import { FieldEditorProps } from './types';

export const IntegerFieldEditor = ({ hook }: FieldEditorProps) => (
  <Grid item xs={12} sm={6}>
    <Stack direction={'row'} gap={2}>
      <CustomNumberField
        label="Minimum Value"
        id="number-field-min"
        value={hook.numMin}
        onChange={(event) => {
          const value = Number.parseFloat(event.target.value);
          hook.setNumMin(value);
          hook.validateNumberFields(value, hook.numMax);
        }}
      />
      <CustomNumberField
        label="Maximum Value"
        id="number-field-max"
        value={hook.numMax}
        onChange={(event) => {
          const value = Number.parseFloat(event.target.value);
          hook.setNumMax(value);
          hook.validateNumberFields(hook.numMin, value);
        }}
      />
    </Stack>
    {hook.validationError && (
      <Typography color="error" variant="body2">
        {hook.validationError}
      </Typography>
    )}
  </Grid>
);

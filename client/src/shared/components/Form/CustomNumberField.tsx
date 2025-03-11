import React from 'react';
import { NumberField } from '@base-ui-components/react/number-field';
import { FormLabel, Grid, Typography } from '@mui/material';

interface CustomNumberFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  id: string;
}

const CustomNumberField: React.FC<CustomNumberFieldProps> = ({
  label,
  value,
  onChange,
  id,
}) => {
  return (
    <Grid item xs={12} sm={6}>
      <NumberField.Root id={id} defaultValue={value ?? undefined}>
        <FormLabel>
          <Typography>{label}</Typography>
        </FormLabel>
        <NumberField.Group style={{ width: '100%' }}>
          <NumberField.Input
            style={{
              width: '40%',
              minWidth: '40px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const newValue =
                event.target.value === '' ? null : Number(event.target.value);
              onChange(newValue);
            }}
          />
        </NumberField.Group>
      </NumberField.Root>
    </Grid>
  );
};

export default CustomNumberField;

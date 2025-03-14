import React, { useCallback } from 'react';
import { TextField } from '@mui/material';
import { NumericFormat } from 'react-number-format';

interface CustomNumberFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  id?: string;
}

const CustomNumberField: React.FC<CustomNumberFieldProps> = ({
  label,
  value,
  onChange,
  id,
}) => {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue =
        event.target.value === '' ? null : Number(event.target.value);
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <NumericFormat
      id={id}
      value={value}
      onChange={handleChange}
      customInput={TextField}
      variant="outlined"
      label={label}
    />
  );
};

export default CustomNumberField;

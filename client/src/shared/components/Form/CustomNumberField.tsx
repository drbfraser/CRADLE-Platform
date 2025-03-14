import React, { CSSProperties, useCallback } from 'react';
import { NumberField } from '@base-ui-components/react/number-field';
import {
  FormControl,
  Input,
  InputLabel,
  SxProps,
  TextField,
} from '@mui/material';

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
      console.log(event.target.value);
      const newValue =
        event.target.value === '' ? null : Number(event.target.value);
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <>
      {/* <TextField
      id={id}
      label={label}
      value={value}
      onChange={handleChange}
      slots={{
        input: NumberInput,
      }}
      variant="filled"
      sx={{}}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
        input: {
          sx: {
            width: '40%',
            minWidth: '40px',
            padding: '10px',
            border: '1px solid #5e4f4f',
            borderRadius: '4px',
            fontSize: '1rem',
          },
        },
      }}
    /> */}
      <NumberInputField
        label={label}
        value={value}
        onChange={handleChange}
        id={id}
      />
    </>
  );
};

interface NumberFieldProps {
  label: string;
  value: number | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}

const NumberInputField = ({ label, value, onChange, id }: NumberFieldProps) => {
  return (
    <FormControl>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <NumberInput
        value={value}
        id={id}
        onChange={onChange}
        style={{
          width: '40%',
          minWidth: '40px',
          padding: '10px',
          // border: '1px solid #5e4f4f',
          // borderRadius: '4px',
          fontSize: '1rem',
        }}
      />
    </FormControl>
  );
};

export default CustomNumberField;

interface NumberInputProps {
  value: number | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  style?: CSSProperties;
}
const NumberInput = ({ value, onChange, id, style }: NumberInputProps) => {
  return (
    <NumberField.Root id={id} value={value}>
      <NumberField.Group style={{ width: '100%' }}>
        <NumberField.Input
          onChange={onChange}
          style={{
            fontSize: '1rem',
            ...style,
          }}
        />
      </NumberField.Group>
    </NumberField.Root>
  );
};

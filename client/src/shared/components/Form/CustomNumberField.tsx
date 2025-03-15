import { TextField, TextFieldProps } from '@mui/material';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

type CustomNumberFieldProps = Omit<
  NumericFormatProps,
  'customInput' | 'min' | 'max'
> &
  Omit<TextFieldProps, 'defaultValue' | 'type'> & {
    value?: string | number | null;
    min?: number | null;
    max?: number | null;
    step?: number;
  };

const CustomNumberField = ({
  variant = 'outlined',
  min,
  max,
  ...props
}: CustomNumberFieldProps) => {
  return (
    <NumericFormat
      customInput={TextField}
      min={min ?? undefined}
      max={max ?? undefined}
      {...props}
    />
  );
};

export default CustomNumberField;

import { TextField, TextFieldProps } from '@mui/material';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

type CustomNumberFieldProps = Omit<NumericFormatProps, 'customInput'> &
  Omit<TextFieldProps, 'defaultValue' | 'type'> & {
    value: string | number | null | undefined;
    min?: number;
    max?: number;
    step?: number;
  };

const CustomNumberField = ({
  variant = 'outlined',
  ...props
}: CustomNumberFieldProps) => {
  return <NumericFormat customInput={TextField} {...props} />;
};

export default CustomNumberField;

import { TextField, TextFieldProps } from '@mui/material';
import { NumericFormat } from 'react-number-format';

type CustomNumberFieldProps = Omit<TextFieldProps, 'defaultValue' | 'type'> & {
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

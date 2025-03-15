import { TextField, TextFieldProps } from '@mui/material';
import { NumericFormat } from 'react-number-format';

type CustomNumberFieldProps = Omit<TextFieldProps, 'defaultValue' | 'type'> & {
  value: number | null | undefined;
};

const CustomNumberField = ({
  variant = 'outlined',
  ...props
}: CustomNumberFieldProps) => {
  return <NumericFormat customInput={TextField} {...props} />;
};

export default CustomNumberField;

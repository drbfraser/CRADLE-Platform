import { TextField, TextFieldProps } from '@mui/material';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

type CustomNumberFieldProps = Omit<NumericFormatProps, 'customInput'> &
  Omit<TextFieldProps, 'defaultValue' | 'type'> & {
    value?: string | number | null;
    step?: number;
    required?: boolean;
    units?: string;
    min?: number;
    max?: number;
  };

const CustomNumberField = ({
  variant = 'outlined',
  required = false,
  units = "",
  min,
  max,
  ...props
}: CustomNumberFieldProps) => {
  return (
    <div className="custom-number-field">
      <NumericFormat
        customInput={TextField}
        required={required}
        inputProps={{ min, max }}
        {...props}
      />
      {units && <span className="units-label">{units}</span>}
    </div>
  );
};

export default CustomNumberField;


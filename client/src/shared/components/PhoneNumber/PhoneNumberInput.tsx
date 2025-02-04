import {
  TextField,
  Select,
  TextFieldProps,
  SelectProps,
  NativeSelectProps,
} from '@mui/material';
import { useFormikContext } from 'formik';

import 'react-phone-number-input/style.css';
import PhoneInputWithCountrySelect from 'react-phone-number-input';

type Props = {
  index: number;
};
export const PhoneNumberInput = ({ index }: Props) => {
  const { values, errors, touched, handleChange, handleBlur } =
    useFormikContext<{
      phoneNumbers: string[];
    }>();
  const phoneNumber = values.phoneNumbers[index];

  return (
    <PhoneInputWithCountrySelect
      name={`phoneNumbers.${index}`}
      value={phoneNumber}
      onChange={(value) => {
        /* Component sometimes passes in an undefined, which will cause Formik to crash. */
        handleChange(value ?? '');
      }}
      onBlur={handleBlur}
      inputComponent={TextField}
      inputProps={inputProps}
      // countrySelectComponent={CountrySelect}
    />
  );
};

const inputProps: TextFieldProps = {
  fullWidth: true,
};

type CountryOption = {
  value?: string;
  label: string;
};

type CountrySelectProps = SelectProps & {
  options: CountryOption[];
  iconComponent: React.ElementType<any, keyof React.JSX.IntrinsicElements>;
};
const CountrySelect = ({
  value,
  options,
  iconComponent,
  ...props
}: CountrySelectProps) => {
  return <Select {...props}></Select>;
};

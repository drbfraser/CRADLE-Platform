import { TextFieldProps } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { isValidNumber } from 'libphonenumber-js';
import { MuiTelInput } from 'mui-tel-input';
import * as Yup from 'yup';

type PhoneNumberFieldProps = TextFieldProps;
export const PhoneNumberField = ({
  name = 'phoneNumber',
  label,
  ...props
}: PhoneNumberFieldProps) => {
  const { handleBlur } = useFormikContext();
  const [field, metaData, helpers] = useField<string>(name);

  const phoneNumber = field.value;
  const { touched, error } = metaData;

  const isError = touched && !!error;
  const errorMessage = isError ? error : undefined;

  return (
    <MuiTelInput
      {...props}
      name={name}
      label={label}
      fullWidth
      forceCallingCode
      defaultCountry={'US'}
      focusOnSelectCountry
      value={phoneNumber}
      onChange={(value) => {
        /* We can't use Formik's `handleChange` because it takes different arguments.  */
        helpers.setValue(value.replaceAll(' ', ''));
      }}
      onBlur={handleBlur}
      error={isError}
      helperText={errorMessage}
    />
  );
};

export const makePhoneNumberValidationSchema = (
  existingPhoneNumbers: string[]
) => {
  return Yup.string()
    .label('Phone Number')
    .max(25)
    .required()
    .notOneOf(existingPhoneNumbers, 'Phone number is already in use')
    .test({
      name: 'test-phone-number-validity',
      test: (value) => {
        return !!value && isValidNumber(value);
      },
      message: 'Invalid phone number',
    });
};

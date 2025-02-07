import { useField, useFormikContext } from 'formik';
import { isValidNumber } from 'libphonenumber-js';
import { MuiTelInput } from 'mui-tel-input';
import * as Yup from 'yup';

type PhoneNumberFieldProps = {
  name?: string;
  label?: string;
};
export const PhoneNumberField = ({
  name = 'phoneNumber',
  label,
}: PhoneNumberFieldProps) => {
  const { handleBlur } = useFormikContext();
  const [field, metaData, helpers] = useField<string>(name);

  const phoneNumber = field.value;
  const { touched, error } = metaData;

  return (
    <MuiTelInput
      label={label}
      fullWidth
      forceCallingCode
      defaultCountry={'US'}
      name={name}
      focusOnSelectCountry
      value={phoneNumber}
      onChange={(value) => {
        /* We can't use Formik's `handleChange` because it takes different arguments.  */
        helpers.setValue(value.replaceAll(' ', ''));
      }}
      onBlur={handleBlur}
      error={touched && !!error}
      helperText={touched && error}
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

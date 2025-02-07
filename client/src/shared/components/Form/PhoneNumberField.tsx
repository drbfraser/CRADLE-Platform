import { useField, useFormikContext } from 'formik';
import { isValidNumber } from 'libphonenumber-js';
import { MuiTelInput } from 'mui-tel-input';

type PhoneNumberFieldProps = {
  name?: string;
  label?: string;
  validatePhoneNumber: (phoneNumber: string) => string | undefined;
};
export const PhoneNumberField = ({
  name = 'phoneNumber',
  label,
  validatePhoneNumber,
}: PhoneNumberFieldProps) => {
  const { handleBlur } = useFormikContext();
  const [field, metaData, helpers] = useField<string>(name);

  const phoneNumber = field.value;
  const errorMessage = validatePhoneNumber(phoneNumber);
  const isTouched = metaData.touched;
  const isError = isTouched && errorMessage !== undefined;

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
      error={isError}
      helperText={isError ? errorMessage : undefined}
    />
  );
};

/**
 * Creates and returns a function which validates a phone number and checks
 * for uniqueness against the array provided as argument to this function.
 *
 * @param {string[]} otherPhoneNumbers - An array of phone numbers to check for uniqueness against.
 *
 * @returns - A function which checks the validity of the
 *  provided phone number and returns a string containing an error message if the phone number
 *  is invalid. The validation function returns `undefined` if the phone number is valid.
 * */
export const makePhoneNumberValidator = (otherPhoneNumbers: string[]) => {
  return (phoneNumber: string) => {
    if (!isValidNumber(phoneNumber)) {
      return 'Invalid Phone Number';
    }
    if (otherPhoneNumbers.includes(phoneNumber)) {
      return 'Phone Number Already In Use';
    }

    return undefined;
  };
};

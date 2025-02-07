import { useField, useFormikContext } from 'formik';
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

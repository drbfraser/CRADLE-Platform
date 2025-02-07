import { useField, useFormikContext } from 'formik';
import { MuiTelInput } from 'mui-tel-input';

type PhoneNumberFieldProps = {
  fieldName: string;
  validatePhoneNumber: (phoneNumber: string) => string | undefined;
};
export const PhoneNumberField = ({
  fieldName = 'phoneNumber',
  validatePhoneNumber,
}: PhoneNumberFieldProps) => {
  const { handleBlur } = useFormikContext();
  const [field, metaData, helpers] = useField<string>(fieldName);

  const phoneNumber = field.value;
  const errorMessage = validatePhoneNumber(phoneNumber);
  const isTouched = metaData.touched;
  const isError = isTouched && errorMessage !== undefined;

  return (
    <MuiTelInput
      fullWidth
      forceCallingCode
      defaultCountry={'US'}
      name={fieldName}
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

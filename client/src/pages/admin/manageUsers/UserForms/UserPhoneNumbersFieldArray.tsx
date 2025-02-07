import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { FieldArray, useFormikContext } from 'formik';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { isValidNumber } from 'libphonenumber-js';
import { PhoneNumberField } from 'src/shared/components/Form/PhoneNumberField';

type UserPhoneNumbersFieldArrayProps = {
  otherUsersPhoneNumbers: string[];
};

/**
 * This component encapsulates logic for managing a variable number of
 * user phone numbers in a form.
 */

export const UserPhoneNumbersFieldArray = ({
  otherUsersPhoneNumbers,
}: UserPhoneNumbersFieldArrayProps) => {
  const { values } = useFormikContext<{ phoneNumbers: string[] }>();

  return (
    <FieldArray
      name={'phoneNumbers'}
      render={(arrayHelpers) => (
        <Box>
          <Typography variant={'h6'} component={'h6'} sx={{ fontSize: '16px' }}>
            Phone Numbers
          </Typography>
          <Stack direction={'column'} gap={1}>
            {values.phoneNumbers.length > 0 &&
              values.phoneNumbers.map((_, index) => (
                <UserPhoneNumberField
                  key={index}
                  fieldName={`phoneNumbers.${index}`}
                  otherUsersPhoneNumbers={otherUsersPhoneNumbers}
                  handleRemove={() => arrayHelpers.remove(index)}
                />
              ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => arrayHelpers.push('')}>
              {'Add Phone Number'}
            </Button>
          </Stack>
        </Box>
      )}
    />
  );
};

/** This field component needs to be defined outside of the main component,
 * otherwise the field will lose focus whenever the state changes.
 */
type UserPhoneNumberFieldProps = {
  fieldName: string;
  otherUsersPhoneNumbers: string[];
  handleRemove: () => void;
};
const UserPhoneNumberField = ({
  fieldName,
  otherUsersPhoneNumbers,
  handleRemove,
}: UserPhoneNumberFieldProps) => {
  const { values } = useFormikContext<{
    phoneNumbers: string[];
  }>();

  const validatePhoneNumber = (phoneNumber: string) => {
    return validateUserPhoneNumber(
      phoneNumber,
      values.phoneNumbers,
      otherUsersPhoneNumbers
    );
  };

  return (
    <Stack direction={'row'}>
      <PhoneNumberField
        name={fieldName}
        validatePhoneNumber={validatePhoneNumber}
      />
      <IconButton
        sx={{
          aspectRatio: 1,
          padding: '4px',
          width: '40px',
          height: '40px',
          marginY: 'auto',
        }}
        onClick={handleRemove}
        disabled={
          values.phoneNumbers.length === 1
        } /** Disable removal button if this is the only phone number. */
      >
        <CloseIcon />
      </IconButton>
    </Stack>
  );
};

const validateUserPhoneNumber = (
  phoneNumber: string,
  thisUsersPhoneNumbers: string[],
  otherUsersPhoneNumbers: string[]
) => {
  if (!isValidNumber(phoneNumber)) {
    return 'Invalid Phone Number';
  }

  // Check if phone number is already in use by this user.
  const thisUserOccurrences = thisUsersPhoneNumbers.filter((value) => {
    return value === phoneNumber;
  }).length;

  // Check if phone number is already in use by other users.
  const otherUserOccurrences = otherUsersPhoneNumbers.filter((value) => {
    return value === phoneNumber;
  }).length;

  if (thisUserOccurrences > 1 || otherUserOccurrences > 0) {
    return 'Phone Number Already In Use';
  }

  return undefined;
};

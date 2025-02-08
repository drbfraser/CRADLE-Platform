import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material';
import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { PhoneNumberField } from 'src/shared/components/Form/PhoneNumberField';
import { MAX_PHONE_NUMBERS_PER_USER } from 'src/shared/constants';

type PhoneNumberArrayFormState = {
  phoneNumbers: string[];
};

/**
 * This component encapsulates logic for managing a variable number of
 * user phone numbers in a form.
 */

export const UserPhoneNumbersFieldArray = () => {
  const { values } = useFormikContext<PhoneNumberArrayFormState>();

  const validatePhoneNumberUniqueness = (phoneNumber: string) => {
    // Validate that phone number occurs at most once for this user.
    const occurrences = values.phoneNumbers.filter(
      (value) => value === phoneNumber
    ).length;

    return occurrences > 1 ? 'Duplicate phone number' : undefined;
  };

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
                <Field
                  name={`phoneNumbers[${index}]`}
                  key={index}
                  validate={validatePhoneNumberUniqueness}>
                  {({ field }: FieldProps<PhoneNumberArrayFormState>) => (
                    <UserPhoneNumberField
                      name={field.name}
                      handleRemove={() => arrayHelpers.remove(index)}
                    />
                  )}
                </Field>
              ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => arrayHelpers.push('')}
              disabled={
                values.phoneNumbers.length >= MAX_PHONE_NUMBERS_PER_USER
              }>
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
  name: string;
  handleRemove: () => void;
};
const UserPhoneNumberField = ({
  name,
  handleRemove,
}: UserPhoneNumberFieldProps) => {
  const { values } = useFormikContext<PhoneNumberArrayFormState>();
  const RemovalButton = () => (
    <InputAdornment position={'end'}>
      <IconButton
        onClick={handleRemove}
        disabled={
          values.phoneNumbers.length === 1
        } /** Disable removal button if this is the only phone number. */
      >
        <CloseIcon />
      </IconButton>
    </InputAdornment>
  );
  return (
    <Stack direction={'row'}>
      <PhoneNumberField
        name={name}
        slotProps={{
          input: {
            endAdornment: <RemovalButton />,
          },
        }}
      />
    </Stack>
  );
};

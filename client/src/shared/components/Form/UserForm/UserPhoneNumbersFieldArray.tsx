import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { Field, FieldArray, useFormikContext } from 'formik';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { TextField as FormikTextField } from 'formik-mui';

/**
 * This component encapsulates logic for managing a variable number of
 * user phone numbers in a form.
 */

export const UserPhoneNumbersFieldArray = () => {
  const { values } = useFormikContext<{ phoneNumbers: string[] }>();
  console.log(values.phoneNumbers);
  return (
    <FieldArray
      name={'phoneNumbers'}
      render={(arrayHelpers) => (
        <Box>
          <Typography variant={'h6'} component={'h6'}>
            Phone Numbers
          </Typography>
          <Stack direction={'column'} gap={1}>
            {values.phoneNumbers.length > 0 &&
              values.phoneNumbers.map((phoneNumber, index) => (
                <PhoneNumberField
                  key={index}
                  index={index}
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
type PhoneNumberFieldProps = {
  index: number;
  handleRemove: () => void;
};
const PhoneNumberField = ({ index, handleRemove }: PhoneNumberFieldProps) => {
  const { values } = useFormikContext<{ phoneNumbers: string[] }>();
  return (
    <Stack direction={'row'}>
      <Field
        id={`new-user-field-phone-number-${index}`}
        component={FormikTextField}
        fullWidth
        variant="outlined"
        name={`phoneNumbers.${index}`}
        inputProps={{
          maxLength: 25,
        }}
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
          values.phoneNumbers.length == 1
        } /** Disable removal button if this is the only phone number. */
      >
        <CloseIcon />
      </IconButton>
    </Stack>
  );
};

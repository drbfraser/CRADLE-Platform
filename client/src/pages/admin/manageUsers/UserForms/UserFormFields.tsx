import {
  TextField as FormikTextField,
  Select as FormikSelect,
  Autocomplete,
} from 'formik-mui';
import {
  AutocompleteRenderInputParams,
  MenuItem,
  TextField,
} from '@mui/material';
import { Field, useFormikContext } from 'formik';
import { UserField, fieldLabels } from './state';
import { userRoleLabels } from 'src/shared/constants';
import { useHealthFacilities } from 'src/shared/hooks/healthFacilities';

export const UserNameField = () => {
  return (
    <Field
      component={FormikTextField}
      fullWidth
      required
      inputProps={{ maxLength: 25 }}
      variant="outlined"
      label={fieldLabels[UserField.name]}
      name={UserField.name}
      validate={(value?: string) => {
        return !value ? 'Name is required' : null;
      }}
    />
  );
};

export const UserEmailField = () => {
  return (
    <Field
      component={FormikTextField}
      fullWidth
      required
      inputProps={{ maxLength: 120 }}
      variant="outlined"
      label={fieldLabels[UserField.email]}
      name={UserField.email}
    />
  );
};

type UserUsernameFieldProps = {
  usernamesInUse: string[];
};
export const UserUsernameField = ({
  usernamesInUse,
}: UserUsernameFieldProps) => {
  const validateUsername = (value?: string) => {
    if (!value) {
      return 'Username is required';
    }
    if (usernamesInUse.includes(value.toLowerCase())) {
      return 'Username already in use';
    }
    return null;
  };
  return (
    <Field
      component={FormikTextField}
      fullWidth
      required
      variant="outlined"
      label={'Username'}
      name={'username'}
      validate={validateUsername}
      autoComplete={'new-password'}
      inputProps={{
        maxLength: 25,
      }}
    />
  );
};

export const UserPasswordField = () => {
  return (
    <>
      <Field
        component={FormikTextField}
        fullWidth
        required
        variant="outlined"
        type="password"
        label={fieldLabels[UserField.password]}
        name={UserField.password}
        autoComplete={'new-password'}
      />
      <Field
        component={FormikTextField}
        fullWidth
        required
        variant="outlined"
        type="password"
        label={fieldLabels[UserField.confirmPassword]}
        name={UserField.confirmPassword}
        autoComplete={'new-password'}
      />
    </>
  );
};

export const UserRoleField = () => {
  return (
    <Field
      component={FormikSelect}
      fullWidth
      required
      variant="outlined"
      label={fieldLabels[UserField.role]}
      name={UserField.role}>
      {Object.entries(userRoleLabels).map(([value, name]) => (
        <MenuItem key={value} value={value}>
          {name}
        </MenuItem>
      ))}
    </Field>
  );
};

export const UserHealthFacilityField = () => {
  const healthFacilities = useHealthFacilities();
  const { touched, errors } = useFormikContext<{
    healthFacilityName: string;
  }>();

  return (
    <Field
      component={Autocomplete}
      fullWidth
      name={UserField.healthFacilityName}
      options={healthFacilities}
      disableClearable={true}
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField
          {...params}
          name={UserField.healthFacilityName}
          error={
            touched[UserField.healthFacilityName] &&
            !!errors[UserField.healthFacilityName]
          }
          helperText={
            touched[UserField.healthFacilityName]
              ? errors[UserField.healthFacilityName]
              : ''
          }
          label={fieldLabels[UserField.healthFacilityName]}
          variant="outlined"
          required
        />
      )}
    />
  );
};

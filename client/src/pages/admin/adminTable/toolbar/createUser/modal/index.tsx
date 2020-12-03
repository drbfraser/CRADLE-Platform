import { FormikErrors, FormikTouched } from 'formik';

import { AutocompleteInput } from '../../../../../../shared/components/input/autocomplete';
import { AutocompleteOption } from '../../../../../../shared/components/input/autocomplete/utils';
import { Callback } from '@types';
import { CreateUserData } from '..';
import { DialogPopup } from '../../../../../../shared/components/dialogPopup';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import React from 'react';
import { RoleEnum } from '../../../../../../enums';
import { TextInput } from '../../../../../../shared/components/input/text';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { useHealthFacilityOptions } from '../../../../../../shared/hooks/healthFacilityOptions';
import { useStyles } from './styles';

interface IProps {
  errors: FormikErrors<CreateUserData>;
  open: boolean;
  submitting: boolean;
  touched: FormikTouched<CreateUserData>;
  values: CreateUserData;
  handleBlur: Callback<React.FocusEvent<HTMLInputElement>>;
  handleClose: () => void;
  handleCreate: () => void;
  handleChange: Callback<React.ChangeEvent<HTMLInputElement>>;
  handleSelectChange: (
    name: `role` | `healthFacilityName`
  ) => (
    event: React.ChangeEvent<Record<string, unknown>>,
    value:
      | AutocompleteOption<string, string>
      | Array<AutocompleteOption<string, string>>
  ) => void;
}

export const CreateUserModal: React.FC<IProps> = ({
  errors,
  open,
  submitting,
  touched,
  values,
  handleBlur,
  handleClose,
  handleCreate,
  handleChange,
  handleSelectChange,
}) => {
  const classes = useStyles();
  //if the user selects admin as the new role → the selection of Health care facility is disabled

  const disableSubmit = React.useMemo((): boolean => {
    const ifNeedHealthFacility =
      values.role?.value === 'ADMIN' ? true : values.healthFacilityName;

    return (
      submitting ||
      Object.entries(errors).length !== 0 ||
      !values.email ||
      !values.firstName ||
      !values.password ||
      !values.role ||
      !ifNeedHealthFacility
    );
  }, [errors, submitting, values]);

  const roles = React.useRef<Array<AutocompleteOption<string, string>>>(
    Object.values(RoleEnum).map(
      (role: RoleEnum): AutocompleteOption<string, string> => ({
        label: role,
        value: role,
      })
    )
  );

  const healthFacilityOptions = useHealthFacilityOptions();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const toggleShowPassword = (): void => {
    setShowPassword((showing: boolean): boolean => !showing);
  };

  return (
    <DialogPopup
      open={open}
      onClose={handleClose}
      aria-labelledby="create-user-dialog-title"
      aria-describedby="create-user-dialog-description"
      content={
        <div className={classes.cardContent}>
          <TextInput
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email ? errors.email : undefined}
            label="Email"
            name="email"
            required={true}
            value={values.email}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <TextInput
            error={Boolean(touched.firstName && errors.firstName)}
            helperText={touched.firstName ? errors.firstName : undefined}
            label="First Name"
            name="firstName"
            required={true}
            value={values.firstName}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <TextInput
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password ? errors.password : undefined}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            label="Password"
            name="password"
            required={true}
            type={showPassword ? `text` : `password`}
            value={values.password}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <AutocompleteInput
            label="Role"
            options={roles.current}
            placeholder="Pick a role"
            value={values.role}
            onChange={handleSelectChange(`role`)}
          />
          <AutocompleteInput
            label="Health Facility"
            options={healthFacilityOptions}
            disabled={values.role?.label === 'ADMIN'}
            placeholder="Pick a health facility"
            value={values.healthFacilityName}
            onChange={handleSelectChange(`healthFacilityName`)}
          />
        </div>
      }
      title="Create A User"
      subtitle="Fields marked with * are required"
      primaryAction={{
        children: `Creat${submitting ? `ing...` : `e`}`,
        disabled: disableSubmit,
        onClick: handleCreate,
      }}
      secondaryAction={{
        children: `Cancel`,
        onClick: handleClose,
      }}
    />
  );
};

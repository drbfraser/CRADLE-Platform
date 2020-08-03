import { FormikErrors, FormikTouched } from 'formik';

import { AutocompleteInput } from '../../../shared/components/input/autocomplete';
import { AutocompleteOption } from '../../../shared/components/input/autocomplete/utils';
import Button from '@material-ui/core/Button';
import { Callback } from '@types';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import React from 'react';
import { RoleEnum } from '../../../enums';
import { SignUpData } from '..';
import { TextInput } from '../../../shared/components/input/text';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { useHealthFacilityOptions } from '../../../shared/hooks/healthFacilityOptions';
import { useStyles } from './styles';

interface IProps {
  errors: FormikErrors<SignUpData>;
  submitting: boolean;
  touched: FormikTouched<SignUpData>;
  values: SignUpData;
  handleBlur: Callback<React.FocusEvent<HTMLInputElement>>;
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

export const SignUpForm: React.FC<IProps> = ({
  errors,
  submitting,
  touched,
  values,
  handleBlur,
  handleCreate,
  handleChange,
  handleSelectChange,
}) => {
  const classes = useStyles();

  const disableSubmit = React.useMemo((): boolean => {
    return (
      submitting ||
      Object.entries(errors).length !== 0 ||
      !values.email ||
      !values.firstName ||
      !values.password ||
      !values.role ||
      !values.healthFacilityName
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
    <Card className={classes.card}>
      <CardHeader
        title="Create A User"
        subheader="Fields marked with * are required"
      />
      <CardContent className={classes.cardContent}>
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
          placeholder="Pick a health facility"
          value={values.healthFacilityName}
          onChange={handleSelectChange(`healthFacilityName`)}
        />
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Button
          color="primary"
          disabled={disableSubmit}
          variant="contained"
          onClick={handleCreate}>
          {`Creat${submitting ? `ing...` : `e`}`}
        </Button>
      </CardActions>
    </Card>
  );
};

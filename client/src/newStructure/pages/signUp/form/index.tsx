import { Callback, OrNull } from '@types';

import { AutocompleteInput } from '../../../shared/components/input/autocomplete';
import { AutocompleteOption } from '../../../shared/components/input/autocomplete/utils';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import React from 'react';
import { RoleEnum } from '../../../enums';
import { TextInput } from '../../../shared/components/input/text';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { useHealthFacilityOptions } from '../../../shared/hooks/healthFacilityOptions';
import { useStyles } from './styles';

interface IProps {
  email: string;
  firstName: string;
  healthFacilityName: OrNull<AutocompleteOption<string, string>>;
  password: string;
  role: OrNull<AutocompleteOption<string, string>>;
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
  email,
  firstName,
  healthFacilityName,
  password,
  role,
  handleCreate,
  handleChange,
  handleSelectChange,
}) => {
  const classes = useStyles();

  const disableSubmit = React.useMemo((): boolean => {
    return !email || !firstName || !password || !role || !healthFacilityName;
  }, [email, firstName, password, role, healthFacilityName]);

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
          label="Email"
          name="email"
          required={true}
          value={email}
          onChange={handleChange}
        />
        <TextInput
          label="First Name"
          name="firstName"
          required={true}
          value={firstName}
          onChange={handleChange}
        />
        <TextInput
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
          value={password}
          onChange={handleChange}
        />
        <AutocompleteInput
          label="Role"
          options={roles.current}
          placeholder="Pick a role"
          value={role}
          onChange={handleSelectChange(`role`)}
        />
        <AutocompleteInput
          label="Health Facility"
          options={healthFacilityOptions}
          placeholder="Pick a health facility"
          value={healthFacilityName}
          onChange={handleSelectChange(`healthFacilityName`)}
        />
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Button
          color="primary"
          disabled={disableSubmit}
          variant="contained"
          onClick={handleCreate}>
          Create
        </Button>
      </CardActions>
    </Card>
  );
};

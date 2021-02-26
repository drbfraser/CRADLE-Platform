import { AutocompleteInput } from '../../../../../../../../../../shared/components/input/autocomplete';
import { AutocompleteOption } from '../../../../../../../../../../shared/components/input/autocomplete/utils';
import { DialogPopup } from '../../../../../../../../../../shared/components/dialogPopup';
import { EditUser } from '@types';
import React from 'react';
import { RoleEnum } from '../../../../../../../../../../enums';
import { TextInput } from '../../../../../../../../../../shared/components/input/text';
import { UpdateOptionsKey } from '../../reducer';
import { roleOptions } from '../../../../../../../../utils';
import { useStyles } from './styles';
import { useTakeActionsContext } from '../../../context/hooks';

interface IProps {
  displayEditUserModal: boolean;
  user: EditUser;
  closeEditUserModal: () => void;
  handleSelectChange: (
    name: UpdateOptionsKey
  ) => (
    event: React.ChangeEvent<Record<string, unknown>>,
    value: AutocompleteOption | Array<AutocompleteOption>
  ) => void;
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: () => void;
}

export const EditUserModal: React.FC<IProps> = ({
  displayEditUserModal,
  user,
  closeEditUserModal,
  handleSelectChange,
  handleChange,
  handleSubmit,
}) => {
  const classes = useStyles();

  const { healthFacilityOptions, vhtOptions } = useTakeActionsContext();

  return (
    <DialogPopup
      open={displayEditUserModal}
      onClose={closeEditUserModal}
      aria-labelledby="edit-user-dialog-title"
      aria-describedby="edit-user-dialog-description"
      content={
        <div className={classes.content}>
          <TextInput
            name="firstName"
            value={user.firstName}
            error={user.firstName.length > 25}
            inputProps={{maxLength: 25}}
            label="First Name"
            placeholder="First Name"
            onChange={handleChange}
            helperText="Must be 25 characters or less."
          />
          <TextInput
            name="email"
            value={user.email}
            error={user.email.length > 50}
            inputProps={{maxLength: 50}}
            label="Email"
            placeholder="Email"
            onChange={handleChange}
            helperText="Must be 50 characters or less."
          />
          <AutocompleteInput
            label="Health Facility"
            options={healthFacilityOptions}
            placeholder="Pick a health facility"
            value={user.healthFacilityName}
            onChange={handleSelectChange(`healthFacilityName`)}
          />
          <AutocompleteInput
            label="Role(s)"
            multiple={true}
            options={roleOptions}
            placeholder="Select the role(s) this user will have"
            value={user.roleIds}
            onChange={handleSelectChange(`roleIds`)}
          />
          {user.roleIds
            .map(
              ({ label }: AutocompleteOption<RoleEnum, number>): RoleEnum =>
                label
            )
            .includes(RoleEnum.CHO) && (
            <AutocompleteInput
              label="VHT(s) to Supervise"
              multiple={true}
              options={vhtOptions}
              placeholder="Select the VHT(s) to be supervised by this user"
              value={user.vhtList}
              onChange={handleSelectChange(`vhtList`)}
            />
          )}
        </div>
      }
      title="Edit User"
      subtitle="Fields marked with * are required"
      primaryAction={{
        children: `Edit`,
        onClick: handleSubmit,
      }}
      secondaryAction={{
        children: `Cancel`,
        onClick: closeEditUserModal,
      }}
    />
  );
};

import { AutocompleteInput } from '../../../../../../../../../../shared/components/input/autocomplete';
import { AutocompleteOption } from '../../../../../../../../../../shared/components/input/autocomplete/utils';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
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
    <Dialog
      open={displayEditUserModal}
      onClose={closeEditUserModal}
      aria-labelledby="edit-user-dialog-title"
      aria-describedby="edit-user-dialog-description"
      fullWidth={true}
      maxWidth="sm">
      <DialogTitle id="edit-user-dialog-title">Edit User</DialogTitle>
      <DialogContent className={classes.content}>
        <DialogContentText id="edit-user-dialog-title">
          Fields marked with * are required
        </DialogContentText>
        <TextInput
          name="firstName"
          value={user.firstName}
          label="First Name"
          placeholder="First Name"
          onChange={handleChange}
        />
        <TextInput
          name="email"
          value={user.email}
          label="Email"
          placeholder="Email"
          onChange={handleChange}
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
            ({ label }: AutocompleteOption<RoleEnum, number>): RoleEnum => label
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
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={closeEditUserModal} color="default">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="outlined">
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

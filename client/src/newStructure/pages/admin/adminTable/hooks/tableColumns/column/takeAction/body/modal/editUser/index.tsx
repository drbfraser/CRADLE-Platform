import {
  Button,
  Dropdown,
  DropdownProps,
  Form,
  Input,
  InputOnChangeData,
  Modal,
  Select,
} from 'semantic-ui-react';

import { EditUser } from '../../reducer';
import React from 'react';
import { RoleEnum } from '../../../../../../../../../../enums';
import { getAllVhtEmails } from './hooks/utils';
import { getRoles } from '../../../../../../utils';
import { roleOptions } from '../../../../../../../../utils';
import { useHealthFacilityOptions } from './hooks/healthFacilityOptions';
import { useStyles } from './styles';
import { useVHTOptions } from './hooks/vhtOptions';

interface IProps {
  displayEditUserModal: boolean;
  user: EditUser;
  closeEditUserModal: () => void;
  handleSelectChange: (
    name: `roleIds` | `vhtList`
  ) => (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => void;
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
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

  const healthFacilityOptions = useHealthFacilityOptions();

  const vhtOptions = useVHTOptions();

  return (
    <Modal
      closeIcon={true}
      open={displayEditUserModal}
      size="tiny"
      onClose={closeEditUserModal}>
      <Modal.Header>User Information</Modal.Header>
      <Modal.Content scrolling>
        <Modal.Description>
          <Form onSubmit={handleSubmit}>
            <Form.Group widths="equal">
              <Form.Field
                name="firstName"
                control={Input}
                value={user.firstName}
                label="Name"
                placeholder="First Name"
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field
                name="email"
                control={Input}
                value={user.email}
                label="Name"
                placeholder="Email"
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field
                name="healthFacilityName"
                control={Select}
                value={user.healthFacilityName}
                label="Health Facility"
                options={healthFacilityOptions}
                placeholder="Health Facility"
                onChange={handleChange}
              />
            </Form.Group>
            <div className={classes.container}>
              <label htmlFor="roles">Role(s)</label>
              <Form.Group widths="equal">
                <Dropdown
                  id="roles"
                  fluid={true}
                  placeholder="Select the role(s) this user will have"
                  multiple={true}
                  selection={true}
                  options={roleOptions}
                  value={getRoles(user.roleIds)}
                  onChange={handleSelectChange(`roleIds`)}
                />
              </Form.Group>
            </div>
            {getRoles(user.roleIds).includes(RoleEnum.CHO) && (
              <div className={classes.container}>
                <label htmlFor="supervising">VHT(s) to Supervise</label>
                <Form.Group widths="equal">
                  <Dropdown
                    id="supervising"
                    fluid={true}
                    placeholder="Select the VHT(s) to be supervised"
                    multiple={true}
                    selection={true}
                    options={vhtOptions}
                    value={getAllVhtEmails(user.vhtList, vhtOptions)}
                    onChange={handleSelectChange(`vhtList`)}
                  />
                </Form.Group>
              </div>
            )}
            <Form.Field control={Button}>Edit User</Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

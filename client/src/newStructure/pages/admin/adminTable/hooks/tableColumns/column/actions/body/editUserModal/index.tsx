import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Select,
} from 'semantic-ui-react';

import React from 'react';
import { RoleEnum } from '../../../../../../../../../enums';
import { User } from '@types';
import { options } from '../../../../../../../utils';
import { useHealthFacilityOptions } from './hooks';

interface IProps {
  displayEditUserModal: boolean;
  selectedUser: User;
  closeEditUserModal: () => void;
  handleDropdownChange: () => void;
  handleVhtDropdownChange: () => void;
  handleSelectChange: () => void;
  handleSubmit: () => void;
}

export const EditUserModal: React.FC<IProps> = ({
  displayEditUserModal,
  selectedUser,
  closeEditUserModal,
  handleDropdownChange,
  handleVhtDropdownChange,
  handleSelectChange,
  handleSubmit,
}) => {
  const healthFacilityOptions = useHealthFacilityOptions();

  return (
    <Modal closeIcon onClose={closeEditUserModal} open={displayEditUserModal}>
      <Modal.Header>User Information</Modal.Header>
      <Modal.Content scrolling>
        <Modal.Description>
          <Form onSubmit={handleSubmit}>
            <Form.Group widths="equal">
              <Form.Field
                name="firstName"
                control={Input}
                value={selectedUser.firstName}
                label="Name"
                placeholder="First Name"
                onChange={handleSelectChange}
              />
              <Form.Field
                name="email"
                control={Input}
                value={selectedUser.email}
                label="Name"
                placeholder="Email"
                onChange={handleSelectChange}
              />
              <Form.Field
                name="healthFacilityName"
                control={Select}
                value={selectedUser.healthFacilityName}
                label="Health Facility"
                options={healthFacilityOptions}
                placeholder="Health Facility"
                onChange={handleSelectChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Field label="User Roles">
                <div></div>
              </Form.Field>
              <Dropdown
                placeholder="Roles"
                fluid={true}
                multiple={true}
                selection={true}
                options={options}
                value={selectedUser.roles}
                onChange={handleDropdownChange}
              />
            </Form.Group>

            {selectedUser.roles.includes(RoleEnum.VHT) && (
              <Form.Group>
                <Form.Field label="VHT Supervising">
                  <div></div>
                </Form.Field>
                <Dropdown
                  placeholder="VHT Supervising"
                  fluid={true}
                  multiple={true}
                  selection={true}
                  options={vhtOptions}
                  value={selectedUser.roles}
                  onChange={handleVhtDropdownChange}
                />
              </Form.Group>
            )}
            <Form.Field control={Button}>Update User</Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

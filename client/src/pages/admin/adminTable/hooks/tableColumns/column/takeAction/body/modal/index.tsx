import {
  Action,
  UpdateOptionsKey,
  UpdateUserKey,
  actionCreators,
} from '../reducer';
import { EditUser, OrNull, VHT } from '@types';
import {
  deleteUser,
  updateUser,
} from '../../../../../../../../../redux/reducers/user/allUsers';

import { AutocompleteOption } from '../../../../../../../../../shared/components/input/autocomplete/utils';
import { DeleteUserModal } from './deleteUser';
import { EditUserModal } from './editUser';
import React from 'react';
import { RoleEnum } from '../../../../../../../../../enums';
import { useDispatch } from 'react-redux';

interface IProps {
  displayDeleteUserModal: boolean;
  displayEditUserModal: boolean;
  user: OrNull<EditUser>;
  updateState: React.Dispatch<Action>;
}

export const UserModal: React.FC<IProps> = ({
  displayDeleteUserModal,
  displayEditUserModal,
  user,
  updateState,
}) => {
  const dispatch = useDispatch();

  const hideEditModal = (): void => {
    updateState(actionCreators.closeEditUserModal());
  };

  const hideDeleteModal = (): void => {
    updateState(actionCreators.closeDeleteUserModal());
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateState(
      actionCreators.updateUser({
        name: event.target.name as UpdateUserKey,
        value: event.target.value,
      })
    );
  };

  const handleSelectChange = (
    name: UpdateOptionsKey
  ): ((
    event: React.ChangeEvent<Record<string, unknown>>,
    value: AutocompleteOption | Array<AutocompleteOption>
  ) => void) => {
    return (
      _: React.ChangeEvent<Record<string, unknown>>,
      value: AutocompleteOption | Array<AutocompleteOption>
    ): void => {
      updateState(
        actionCreators.updateOptions({
          name,
          value,
        })
      );
    };
  };

  const handleEditUser = (): void => {
    if (user) {
      const { healthFacilityName, roleIds, vhtList, ...currentUser } = user;

      dispatch(
        updateUser({
          userId: user.id,
          userToUpdate: {
            email: currentUser.email,
            firstName: currentUser.firstName,
            healthFacilityName: healthFacilityName.value,
            newRoleIds: roleIds.map(
              ({ value }: AutocompleteOption<RoleEnum, number>): number => {
                return value;
              }
            ),
            newVHTs: vhtList.map(
              ({ label, value }: AutocompleteOption<string, number>): VHT => {
                return {
                  email: label,
                  id: value,
                };
              }
            ),
            username: currentUser.username,
          },
          currentUser,
        })
      );
      hideEditModal();
    }
  };

  const handleDeleteUser = (): void => {
    if (user) {
      dispatch(deleteUser(user.id));
      hideDeleteModal();
    }
  };

  return user ? (
    <>
      <EditUserModal
        displayEditUserModal={displayEditUserModal}
        user={user}
        closeEditUserModal={hideEditModal}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleEditUser}
      />
      <DeleteUserModal
        displayDeleteUserModal={displayDeleteUserModal}
        email={user.email}
        firstName={user.firstName}
        closeDeleteUserModal={hideDeleteModal}
        handleDelete={handleDeleteUser}
      />
    </>
  ) : null;
};

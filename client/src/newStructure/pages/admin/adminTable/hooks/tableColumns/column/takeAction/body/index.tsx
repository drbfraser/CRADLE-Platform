import { DropdownProps, InputOnChangeData } from 'semantic-ui-react';
import { OrNull, User } from '@types';
import { actionCreators, initialState, reducer } from './reducer';

import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import { DeleteUserModal } from './modal/deleteUser';
import { EditUserModal } from './modal/editUser';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import { ReduxState } from 'src/newStructure/redux/reducers';
import Tooltip from '@material-ui/core/Tooltip';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';

interface IProps {
  userId: number;
}

export const TakeActionBody: React.FC<IProps> = ({ userId }) => {
  const [state, updateState] = React.useReducer(reducer, initialState);

  const classes = useStyles();

  const users = useSelector(
    ({ user }: ReduxState): OrNull<Array<User>> => {
      return user.allUsers.data;
    }
  );

  React.useEffect((): void => {
    const user = users?.find((user: User): boolean => user.id === userId);

    if (user) {
      updateState(
        actionCreators.initializeUser({
          user,
        })
      );
    }
  }, [users, userId, updateState]);

  const showEditModal = (): void => {
    updateState(actionCreators.openEditUserModal());
  };

  const hideEditModal = (): void => {
    updateState(actionCreators.closeEditUserModal());
  };

  const showDeleteModal = (): void => {
    updateState(actionCreators.openDeleteUserModal());
  };

  const hideDeleteModal = (): void => {
    updateState(actionCreators.closeDeleteUserModal());
  };

  const handleChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
  ): void => {
    updateState(actionCreators.updateUser({ name, value }));
  };

  const handleSelectChange = (
    name: `roleIds` | `vhtList`
  ): ((
    event: React.SyntheticEvent<HTMLElement, Event>,
    { value }: DropdownProps
  ) => void) => {
    return (
      _: React.SyntheticEvent<HTMLElement, Event>,
      { value }: DropdownProps
    ): void => {
      alert(value);
      updateState(
        actionCreators.updateUser({
          name,
          value: value as Array<number>,
        })
      );
    };
  };

  return (
    <>
      {state.user && (
        <>
          <EditUserModal
            displayEditUserModal={state.displayEditUserModal}
            user={state.user}
            closeEditUserModal={hideEditModal}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleSubmit={hideEditModal}
          />
          <DeleteUserModal
            displayDeleteUserModal={state.displayDeleteUserModal}
            email={state.user.email}
            firstName={state.user.firstName}
            closeDeleteUserModal={hideDeleteModal}
            handleDelete={hideDeleteModal}
          />
        </>
      )}
      <div className={classes.container}>
        <Tooltip placement="top" title="Edit user">
          <IconButton onClick={showEditModal}>
            <CreateIcon className={classes.icon} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title="Delete user">
          <IconButton onClick={showDeleteModal}>
            <DeleteIcon className={classes.icon} />
          </IconButton>
        </Tooltip>
      </div>
    </>
  );
};

import { OrNull, User } from '@types';
import { actionCreators, initialState, reducer } from './reducer';

import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import { ReduxState } from '../../../../../../../../redux/reducers';
import { RoleEnum } from '../../../../../../../../enums';
import Tooltip from '@material-ui/core/Tooltip';
import { UserModal } from './modal';
import { getRoles } from '../../../../utils';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';

interface IProps {
  userId: number;
}

export const TakeActionBody: React.FC<IProps> = ({ userId }) => {
  const [admin, setAdmin] = React.useState<boolean>(false);
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
      setAdmin(getRoles(user.roleIds).includes(RoleEnum.ADMIN));

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

  const showDeleteModal = (): void => {
    updateState(actionCreators.openDeleteUserModal());
  };

  return (
    <>
      <UserModal
        displayDeleteUserModal={state.displayDeleteUserModal}
        displayEditUserModal={state.displayEditUserModal}
        user={state.user}
        updateState={updateState}
      />
      {!admin && (
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
      )}
    </>
  );
};

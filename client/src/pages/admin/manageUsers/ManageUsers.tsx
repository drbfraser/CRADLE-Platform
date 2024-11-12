import { Button } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

import CreateIcon from '@mui/icons-material/Create';
import DeleteForever from '@mui/icons-material/DeleteForever';
import DeleteUser from './DeleteUser';
import { EditUserDialog } from './EditUserDialog';
import ResetPassword from './ResetPassword';
import { UserWithIndex } from 'src/shared/types';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { getUsersAsync } from 'src/shared/api/api';
import { userRoleLabels } from 'src/shared/constants';
import AddIcon from '@mui/icons-material/Add';

import {
  GridRowsProp,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import { useAppSelector } from 'src/shared/hooks';
import { selectCurrentUser } from 'src/redux/reducers/user/currentUser';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import { DataTableHeader } from '../../../shared/components/DataTable/DataTableHeader';
import { CreateUserDialog } from './CreateUserDialog';

export const ManageUsers = () => {
  const [errorLoading, setErrorLoading] = useState(false);
  const [users, setUsers] = useState<UserWithIndex[]>([]);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [createPopupOpen, setCreatePopupOpen] = useState(false);
  const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [popupUser, setPopupUser] = useState<UserWithIndex>();

  const [rows, setRows] = useState<GridRowsProp>([]);
  const updateRowData = (users: UserWithIndex[]) => {
    setRows(
      users.map((user, index) => ({
        id: index,
        firstName: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        healthFacility: user.healthFacilityName,
        role: userRoleLabels[user.role],
        takeAction: user,
      }))
    );
  };

  // Component to render buttons inside the last cell of each row.
  const ActionButtons = useCallback(
    ({ user }: { user?: UserWithIndex }) => {
      const { data: currentUser } = useAppSelector(selectCurrentUser);
      const isCurrentUser = currentUser?.id === user?.id;
      const actions: TableAction[] = [
        {
          tooltip: 'Edit User',
          onClick: () => {
            setPopupUser(user);
            setEditPopupOpen(true);
          },
          Icon: CreateIcon,
        },
        {
          tooltip: 'Reset Password',
          onClick: () => {
            setPopupUser(user);
            setPasswordPopupOpen(true);
          },
          Icon: VpnKeyIcon,
        },
        {
          tooltip: 'Delete User',
          onClick: () => {
            if (isCurrentUser) {
              return;
            }
            setPopupUser(user);
            setDeletePopupOpen(true);
          },
          Icon: DeleteForever,
          disabled: isCurrentUser,
        },
      ];

      return <TableActionButtons actions={actions} />;
    },
    [setPopupUser]
  );

  const columns: GridColDef[] = [
    { flex: 1, field: 'firstName', headerName: 'First Name' },
    { flex: 1, field: 'email', headerName: 'Email' },
    { flex: 1, field: 'phoneNumber', headerName: 'Phone Number' },
    { flex: 1, field: 'healthFacility', headerName: 'Health Facility' },
    { flex: 1, field: 'role', headerName: 'Role' },
    {
      flex: 1,
      field: 'takeAction',
      headerName: 'Take Action',
      filterable: false,
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, UserWithIndex>) => (
        <ActionButtons user={params.value} />
      ),
    },
  ];

  const getUsers = async () => {
    try {
      const users: UserWithIndex[] = (await getUsersAsync()).map(
        (user, index) => ({
          ...user,
          index,
        })
      );
      setUsers(users);
      updateRowData(users);
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const addNewUser = useCallback(() => {
    setPopupUser(undefined);
    setCreatePopupOpen(true);
  }, [setPopupUser, setCreatePopupOpen]);

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <EditUserDialog
        open={editPopupOpen}
        onClose={() => {
          setEditPopupOpen(false);
          getUsers();
        }}
        users={users}
        editUser={popupUser}
      />
      <CreateUserDialog
        open={createPopupOpen}
        onClose={() => {
          setCreatePopupOpen(false);
          getUsers();
        }}
        users={users}
      />
      <ResetPassword
        open={passwordPopupOpen}
        onClose={() => setPasswordPopupOpen(false)}
        resetUser={popupUser}
      />
      <DeleteUser
        open={deletePopupOpen}
        onClose={() => {
          setDeletePopupOpen(false);
          getUsers();
        }}
        user={popupUser}
      />
      <DataTableHeader title={'Users'}>
        <Button
          variant={'contained'}
          startIcon={<AddIcon />}
          onClick={addNewUser}>
          {'New User'}
        </Button>
      </DataTableHeader>
      <DataTable rows={rows} columns={columns} />
    </>
  );
};

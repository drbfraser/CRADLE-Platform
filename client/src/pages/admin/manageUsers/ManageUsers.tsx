import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import {
  AdminTable,
  AdminTableActionButtonsContainer,
  AdminTableToolbar,
  AdminToolBarButton,
} from '../AdminTable';
import CreateIcon from '@mui/icons-material/Create';
import DeleteForever from '@mui/icons-material/DeleteForever';
import DeleteUser from './DeleteUser';
import EditUser from './EditUser';
import ResetPassword from './ResetPassword';
import { IUserWithIndex } from 'src/shared/types';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { getUsersAsync } from 'src/shared/api';
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

export const ManageUsers = () => {
  const [errorLoading, setErrorLoading] = useState(false);
  const [users, setUsers] = useState<IUserWithIndex[]>([]);
  const [search, setSearch] = useState('');
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [popupUser, setPopupUser] = useState<IUserWithIndex>();

  const [rows, setRows] = useState<GridRowsProp>([]);
  const updateRowData = (users: IUserWithIndex[]) => {
    setRows(
      users.map((user, index) => ({
        id: index,
        firstName: user.firstName,
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
    ({ user }: { user?: IUserWithIndex }) => {
      const { data: currentUser } = useAppSelector(selectCurrentUser);
      const isCurrentUser = currentUser?.userId === user?.userId;
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
      renderCell: (params: GridRenderCellParams<any, IUserWithIndex>) => (
        <ActionButtons user={params.value} />
      ),
    },
  ];

  const getUsers = async () => {
    try {
      const users: IUserWithIndex[] = await getUsersAsync();
      setUsers(users);
      updateRowData(users);
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    const searchLowerCase = search.toLowerCase().trim();
    const userFilter = (user: IUserWithIndex) => {
      return (
        user.firstName.toLowerCase().includes(searchLowerCase) ||
        user.email.toLowerCase().includes(searchLowerCase) ||
        user.healthFacilityName.toLowerCase().includes(searchLowerCase)
      );
    };
    const filteredUsers = users.filter(userFilter);
    updateRowData(filteredUsers);
  }, [users, search]);

  const addNewUser = useCallback(() => {
    setPopupUser(undefined);
    setEditPopupOpen(true);
  }, [setPopupUser, setEditPopupOpen]);

  const toolbar = useCallback(
    () => (
      <AdminTableToolbar title={'Users'} setSearch={setSearch}>
        <AdminToolBarButton onClick={addNewUser}>
          <AddIcon /> {'New User'}
        </AdminToolBarButton>
      </AdminTableToolbar>
    ),
    [setSearch]
  );

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <EditUser
        open={editPopupOpen}
        onClose={() => {
          setEditPopupOpen(false);
          getUsers();
        }}
        users={users}
        editUser={popupUser}
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
      <AdminTable rows={rows} columns={columns} toolbar={toolbar} />
    </>
  );
};

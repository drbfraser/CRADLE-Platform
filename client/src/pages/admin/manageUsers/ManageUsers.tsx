import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CreateIcon from '@mui/icons-material/Create';
import DeleteForever from '@mui/icons-material/DeleteForever';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AddIcon from '@mui/icons-material/Add';

import { UserWithIndex } from 'src/shared/types';
import { getUsersAsync } from 'src/shared/api/api';
import { userRoleLabels } from 'src/shared/constants';
import { useAppSelector } from 'src/shared/hooks';
import { selectCurrentUser } from 'src/redux/reducers/user/currentUser';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
import { CreateUserDialog } from './UserForms/CreateUserDialog';
import { formatPhoneNumbers } from 'src/shared/utils';
import { EditUserDialog } from './UserForms/EditUserDialog';
import DeleteUser from './DeleteUser';
import ResetPassword from './ResetPassword';

export const ManageUsers = () => {
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [createPopupOpen, setCreatePopupOpen] = useState(false);
  const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [popupUser, setPopupUser] = useState<UserWithIndex>();

  const usersQuery = useQuery({
    queryKey: ['usersList'],
    queryFn: getUsersAsync,
  });
  const users = usersQuery.data ?? [];

  // Component to render buttons inside the last cell of each row.
  const { data: currentUser } = useAppSelector(selectCurrentUser);
  const ActionButtons = useCallback(
    ({ user }: { user?: UserWithIndex }) => {
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
    [currentUser?.id]
  );

  const columns: GridColDef[] = [
    { flex: 1, field: 'name', headerName: 'Name' },
    { flex: 1, field: 'email', headerName: 'Email' },
    { flex: 1, field: 'phoneNumbers', headerName: 'Phone Numbers' },
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

  const addNewUser = useCallback(() => {
    setPopupUser(undefined);
    setCreatePopupOpen(true);
  }, [setPopupUser, setCreatePopupOpen]);

  return (
    <>
      {usersQuery.isError && <APIErrorToast />}

      <CreateUserDialog
        open={createPopupOpen}
        onClose={() => {
          setCreatePopupOpen(false);
          usersQuery.refetch();
        }}
        users={users}
      />
      {popupUser && (
        <>
          <EditUserDialog
            open={editPopupOpen}
            onClose={() => {
              setEditPopupOpen(false);
              usersQuery.refetch();
            }}
            users={users}
            userToEdit={popupUser}
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
              usersQuery.refetch();
            }}
            user={popupUser}
          />
        </>
      )}

      <DataTableHeader title="Users">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addNewUser}>
          New User
        </Button>
      </DataTableHeader>
      <DataTable
        rows={users.map((u, index) => ({
          id: index,
          name: u.name,
          email: u.email,
          phoneNumbers: formatPhoneNumbers(u.phoneNumbers),
          healthFacility: u.healthFacilityName,
          role: userRoleLabels[u.role],
          takeAction: u,
        }))}
        columns={columns}
      />
    </>
  );
};

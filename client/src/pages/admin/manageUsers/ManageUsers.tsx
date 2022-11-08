import { IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import AdminTable from '../AdminTable';
import CreateIcon from '@mui/icons-material/Create';
import DeleteForever from '@mui/icons-material/DeleteForever';
import DeleteUser from './DeleteUser';
import EditUser from './EditUser';
import { IUserWithIndex } from 'src/shared/types';
import { ReduxState } from 'src/redux/reducers';
import ResetPassword from './ResetPassword';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { getUsersAsync } from 'src/shared/api';
import { useAdminStyles } from '../adminStyles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelector } from 'react-redux';
import { userRoleLabels } from 'src/shared/constants';

export const ManageUsers = () => {
  const styles = useAdminStyles();
  const currentUserId = useSelector<ReduxState>(
    (state) => state.user.current.data!.userId
  ) as number;
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [users, setUsers] = useState<IUserWithIndex[]>([]);
  const [search, setSearch] = useState('');
  const [tableData, setTableData] = useState<(string | number)[][]>([]);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [popupUser, setPopupUser] = useState<IUserWithIndex>();
  const isTransformed = useMediaQuery('(min-width:900px)');

  const columns = [
    {
      name: 'First Name',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Email',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Phone Number',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Health Facility',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Role',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Take Action',
      options: {
        sort: false,
        display: isTransformed ? true : false,
      },
    },
  ];

  const getUsers = async () => {
    try {
      const resp: IUserWithIndex[] = await getUsersAsync();

      setUsers(resp.map((user, index) => ({ ...user, index })));
      setLoading(false);
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
        user.firstName.toLowerCase().startsWith(searchLowerCase) ||
        user.email.toLowerCase().startsWith(searchLowerCase) ||
        user.healthFacilityName.toLowerCase().startsWith(searchLowerCase)
      );
    };

    const rows = users
      .filter(userFilter)
      .map((u) => [
        u.firstName,
        u.email,
        u.phoneNumber,
        u.healthFacilityName,
        userRoleLabels[u.role],
        u.index,
      ]);

    setTableData(rows);
  }, [users, search]);

  const rowActions = [
    {
      tooltip: 'Edit User',
      setOpen: setEditPopupOpen,
      Icon: CreateIcon,
    },
    {
      tooltip: 'Reset Password',
      setOpen: setPasswordPopupOpen,
      Icon: VpnKeyIcon,
    },
    {
      tooltip: 'Delete User',
      setOpen: setDeletePopupOpen,
      Icon: DeleteForever,
      disableForCurrentUser: true,
    },
  ];

  const Row = ({ row }: { row: (string | number)[] }) => {
    console.log('row', row);
    const cells = row.slice(0, -1);
    console.log('cells', cells);
    console.log('users', users);
    const user = users[row.slice(-1)[0] as number];
    console.log('user', user);
    const isCurrentUser = user?.userId === currentUserId;
    const actions = isCurrentUser
      ? rowActions.filter((a) => !a.disableForCurrentUser)
      : rowActions;

    return (
      <tr className={styles.row}>
        <TableCell label="First Name" isTransformed={isTransformed}>
          {cells[0]}
        </TableCell>
        <TableCell label="Email" isTransformed={isTransformed}>
          {cells[1]}
        </TableCell>
        <TableCell label="Phone Number" isTransformed={isTransformed}>
          {cells[2]}
        </TableCell>
        <TableCell label="Health Facility" isTransformed={isTransformed}>
          {cells[3]}
        </TableCell>
        <TableCell label="Role" isTransformed={isTransformed}>
          {cells[4]}
        </TableCell>
        <TableCell label="Take Action" isTransformed={isTransformed}>
          {actions.map((action) => (
            <Tooltip
              key={action.tooltip}
              placement="top"
              title={action.tooltip}>
              <IconButton
                onClick={() => {
                  setPopupUser(user);
                  action.setOpen(true);
                }}
                size="large">
                <action.Icon />
              </IconButton>
            </Tooltip>
          ))}
        </TableCell>
      </tr>
    );
  };

  return (
    <div className={styles.tableContainer}>
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
      <AdminTable
        title="Users"
        newBtnLabel="New User"
        newBtnOnClick={() => {
          setPopupUser(undefined);
          setEditPopupOpen(true);
        }}
        search={search}
        setSearch={setSearch}
        columns={columns}
        Row={Row}
        data={tableData}
        loading={loading}
        isTransformed={isTransformed}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { apiFetch } from 'src/shared/utils/api';
import { BASE_URL } from 'src/server/utils';
import { EndpointEnum } from 'src/server';
import { IconButton, Tooltip } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import DeleteForever from '@material-ui/icons/DeleteForever';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { Toast } from 'src/shared/components/toast';
import EditUser from './EditUser';
import ResetPassword from './ResetPassword';
import DeleteUser from './DeleteUser';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUser } from 'src/types';
import { userRoles } from 'src/enums';
import { useAdminStyles } from '../adminStyles';
import AdminTable from '../AdminTable';

const columns = [
  'First Name',
  'Email',
  'Health Facility',
  'Role',
  {
    name: 'Take Action',
    options: {
      sort: false,
    },
  },
];

export const ManageUsers = () => {
  const styles = useAdminStyles();
  const currentUserId = useSelector<ReduxState>(
    (state) => state.user.current.data!.userId
  ) as number;
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState('');
  const [tableData, setTableData] = useState<(string | number)[][]>([]);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [popupUser, setPopupUser] = useState<IUser>();

  const getUsers = async () => {
    try {
      const resp: IUser[] = await (
        await apiFetch(BASE_URL + EndpointEnum.USER_ALL)
      ).json();

      setUsers(resp);
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

    const userFilter = (user: IUser) => {
      return (
        user.firstName.toLowerCase().startsWith(searchLowerCase) ||
        user.email.toLowerCase().startsWith(searchLowerCase) ||
        user.healthFacilityName.toLowerCase().startsWith(searchLowerCase)
      );
    };

    const rows = users
      .filter(userFilter)
      .map((u, idx) => [
        u.firstName,
        u.email,
        u.healthFacilityName,
        userRoles[u.role],
        idx,
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
    const cells = row.slice(0, -1);
    const user = users[row.slice(-1)[0] as number];
    const isCurrentUser = user?.userId === currentUserId;
    const actions = isCurrentUser
      ? rowActions.filter((a) => !a.disableForCurrentUser)
      : rowActions;

    return (
      <tr className={styles.row}>
        {cells.map((item, i) => (
          <td className={styles.cell} key={i}>
            {item}
          </td>
        ))}
        <td className={styles.cell}>
          {actions.map((action) => (
            <Tooltip
              key={action.tooltip}
              placement="top"
              title={action.tooltip}>
              <IconButton
                onClick={() => {
                  setPopupUser(user);
                  action.setOpen(true);
                }}>
                <action.Icon />
              </IconButton>
            </Tooltip>
          ))}
        </td>
      </tr>
    );
  };

  return (
    <div className={styles.tableContainer}>
      {errorLoading && (
        <Toast
          status="error"
          message="Something went wrong loading the users. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}
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
        deleteUser={popupUser}
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
      />
    </div>
  );
};

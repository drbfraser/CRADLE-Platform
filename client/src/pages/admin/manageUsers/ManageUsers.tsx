import React, { useEffect, useState } from 'react';
import { apiFetch } from 'src/shared/utils/api';
import { BASE_URL } from 'src/server/utils';
import { EndpointEnum } from 'src/server';
import MUIDataTable from 'mui-datatables';
import { makeStyles } from '@material-ui/core/styles';
import { Button, IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CreateIcon from '@material-ui/icons/Create';
import DeleteForever from '@material-ui/icons/DeleteForever';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { Toast } from 'src/shared/components/toast';
import EditUser from './EditUser';
import { IUserGet } from './state';
import ResetPassword from './ResetPassword';
import DeleteUser from './DeleteUser';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';

const columns = [
  'First Name',
  'Email',
  'Health Facility',
  'Roles',
  {
    name: 'Take Action',
    options: {
      sort: false,
    },
  },
];

export const ManageUsers = () => {
  const styles = useStyles();
  const currentUserId = useSelector<ReduxState>(state => state.user.current.data!.userId) as number;
  const [errorLoading, setErrorLoading] = useState(false);
  const [users, setUsers] = useState<IUserGet[]>([]);
  const [tableData, setTableData] = useState<(string | number)[][]>([]);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [popupUser, setPopupUser] = useState<IUserGet>();

  const getUsers = async () => {
    try {
      const resp: IUserGet[] = await (
        await apiFetch(BASE_URL + EndpointEnum.USER + EndpointEnum.ALL)
      ).json();

      setUsers(resp);
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    const rows = users.map((u, idx) => [
      u.firstName,
      u.email,
      u.healthFacilityName,
      u.roleIds.join(', '),
      idx,
    ]);
    setTableData(rows);
  }, [users]);

  const CreateUserButton = () => (
    <Button
      className={styles.button}
      color="primary"
      variant="contained"
      size="large"
      onClick={() => {
        setPopupUser(undefined);
        setEditPopupOpen(true);
      }}>
      <AddIcon />
      New User
    </Button>
  );

  const rowActions = [
    {
      tooltip: "Edit User",
      setOpen: setEditPopupOpen,
      Icon: CreateIcon,
    },
    {
      tooltip: "Reset Password",
      setOpen: setPasswordPopupOpen,
      Icon: VpnKeyIcon,
    },
    {
      tooltip: "Delete User",
      setOpen: setDeletePopupOpen,
      Icon: DeleteForever,
      disableForCurrentUser: true,
    },
  ]

  const Row = ({ row }: { row: (string | number)[] }) => {
    const cells = row.slice(0, -1);
    const user = users[row.slice(-1)[0] as number];
    const isCurrentUser = user?.id === currentUserId;
    const actions = isCurrentUser ? rowActions.filter(a => !a.disableForCurrentUser) : rowActions;

    return (
      <tr className={styles.row}>
        {cells.map((item, i) => (
          <td className={styles.cell} key={i}>
            {item}
          </td>
        ))}
        <td className={styles.cell}>
          {
            actions.map(action => (
              <Tooltip placement="top" title={action.tooltip}>
                <IconButton
                  onClick={() => {
                    setPopupUser(user);
                    action.setOpen(true)
                  }}>
                  <action.Icon />
                </IconButton>
              </Tooltip>
            ))
          }
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
        userId={popupUser?.id ?? -1}
        name={popupUser?.firstName ?? ""}
      />
      <DeleteUser
        open={deletePopupOpen}
        onClose={() => {
          setDeletePopupOpen(false);
          getUsers();
        }}
        userId={popupUser?.id ?? -1}
        name={popupUser?.firstName ?? ""}
      />
      <MUIDataTable
        title="Users"
        columns={columns}
        data={tableData}
        options={{
          elevation: 0,
          search: false,
          download: false,
          print: false,
          viewColumns: false,
          filter: false,
          selectToolbarPlacement: 'none',
          selectableRows: 'none',
          rowHover: false,
          responsive: 'standard',
          customToolbar: () => <CreateUserButton />,
          customRowRender: (row, i) => <Row key={i} row={row} />,
        }}
      />
    </div>
  );
};

const useStyles = makeStyles({
  tableContainer: {
    '& .MuiTableCell-head': {
      fontWeight: 'bold',
    },
    '& .MuiTableSortLabel-icon': {
      marginTop: 15,
    },
  },
  row: {
    borderBottom: '1px solid #ddd',
  },
  cell: {
    padding: '4px 16px',
  },
  button: {
    height: '100%',
  },
});

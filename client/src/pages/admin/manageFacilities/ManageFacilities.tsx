import React, { useEffect, useState } from 'react';
import { apiFetch } from 'src/shared/utils/api';
import { BASE_URL } from 'src/server/utils';
import { EndpointEnum } from 'src/server';
import MUIDataTable from 'mui-datatables';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  IconButton,
  LinearProgress,
  TextField,
  Tooltip,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CreateIcon from '@material-ui/icons/Create';
import { Toast } from 'src/shared/components/toast';
import { IFacility } from './state';
import EditFacility from './EditFacility';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';
import { useDispatch } from 'react-redux';

const columns = [
  'Facility Name',
  'Phone Number',
  'Location',
  {
    name: 'Take Action',
    options: {
      sort: false,
    },
  },
];

export const ManageFacilities = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [facilities, setFacilities] = useState<IFacility[]>([]);
  const [search, setSearch] = useState('');
  const [tableData, setTableData] = useState<(string | number)[][]>([]);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState<IFacility>();

  const getFacilities = async () => {
    try {
      const resp: IFacility[] = await (
        await apiFetch(BASE_URL + EndpointEnum.HEALTH_FACILITIES)
      ).json();

      setFacilities(resp);
      setLoading(false);
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getFacilities();
  }, []);

  useEffect(() => {
    const searchLowerCase = search.toLowerCase().trim();

    const facilityFilter = (facility: IFacility) => {
      return (
        facility.healthFacilityName.toLowerCase().startsWith(searchLowerCase) ||
        facility.location.toLowerCase().startsWith(searchLowerCase)
      );
    };

    const rows = facilities
      .filter(facilityFilter)
      .map((f, idx) => [
        f.healthFacilityName,
        f.healthFacilityPhoneNumber,
        f.location,
        idx,
      ]);
    setTableData(rows);
  }, [facilities, search]);

  const Toolbar = () => (
    <>
      <TextField
        type="text"
        variant="outlined"
        size="small"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      &nbsp; &nbsp;
      <Button
        className={styles.button}
        color="primary"
        variant="contained"
        size="large"
        onClick={() => {
          setFacilityToEdit(undefined);
          setEditPopupOpen(true);
        }}>
        <AddIcon />
        New Facility
      </Button>
    </>
  );

  const Row = ({ row }: { row: (string | number)[] }) => {
    const cells = row.slice(0, -1);
    const facility = facilities[row.slice(-1)[0] as number];

    return (
      <tr className={styles.row}>
        {cells.map((item, i) => (
          <td className={styles.cell} key={i}>
            {item}
          </td>
        ))}
        <td className={styles.cell}>
          <Tooltip placement="top" title="Edit Facility">
            <IconButton
              onClick={() => {
                setFacilityToEdit(facility);
                setEditPopupOpen(true);
              }}>
              <CreateIcon />
            </IconButton>
          </Tooltip>
        </td>
      </tr>
    );
  };

  return (
    <div className={styles.tableContainer}>
      {errorLoading && (
        <Toast
          status="error"
          message="Something went wrong loading the health care facilities. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}
      <EditFacility
        open={editPopupOpen}
        onClose={() => {
          setEditPopupOpen(false);
          dispatch(getHealthFacilityList());
          getFacilities();
        }}
        facilities={facilities}
        editFacility={facilityToEdit}
      />
      <MUIDataTable
        title="Health Care Facilities"
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
          customToolbar: Toolbar,
          customRowRender: (row, i) => <Row key={i} row={row} />,
          textLabels: {
            body: {
              noMatch: loading ? (
                <LinearProgress />
              ) : (
                'Sorry, no matching facilities found.'
              ),
            },
          },
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

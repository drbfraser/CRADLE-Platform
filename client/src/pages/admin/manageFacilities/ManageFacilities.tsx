import { IconButton, TableRow, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import AdminTable, { AdminTableContainer } from '../AdminTable';
import CreateIcon from '@mui/icons-material/Create';
import EditFacility from './EditFacility';
import { IFacility } from 'src/shared/types';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { getHealthFacilitiesAsync } from 'src/shared/api';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';
import { useAppDispatch } from 'src/shared/hooks';
import useMediaQuery from '@mui/material/useMediaQuery';

export const ManageFacilities = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [facilities, setFacilities] = useState<IFacility[]>([]);
  const [search, setSearch] = useState('');
  const [tableData, setTableData] = useState<(string | number)[][]>([]);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState<IFacility>();
  const isTransformed = useMediaQuery('(min-width:900px)');

  const columns = [
    {
      name: 'Facility Name',
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
      name: 'Location',
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

  const getFacilities = async () => {
    try {
      const resp: IFacility[] = await getHealthFacilitiesAsync();

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

  const Row = ({ row }: { row: (string | number)[] }) => {
    const cells = row.slice(0, -1);
    const facility = facilities[row.slice(-1)[0] as number];

    return (
      <TableRow
        sx={{
          borderBottom: '1px solid #ddd',
        }}>
        <TableCell label="Facility Name" isTransformed={isTransformed}>
          {cells[0]}
        </TableCell>
        <TableCell label="Phone Number" isTransformed={isTransformed}>
          {cells[1]}
        </TableCell>
        <TableCell label="Location" isTransformed={isTransformed}>
          {cells[2]}
        </TableCell>
        <TableCell label="Take Action" isTransformed={isTransformed}>
          <Tooltip placement="top" title="Edit Facility">
            <IconButton
              onClick={() => {
                setFacilityToEdit(facility);
                setEditPopupOpen(true);
              }}
              size="large">
              <CreateIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <AdminTableContainer>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
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
      <AdminTable
        title="Health Care Facilities"
        newBtnLabel="New Facility"
        newBtnOnClick={() => {
          setFacilityToEdit(undefined);
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
    </AdminTableContainer>
  );
};

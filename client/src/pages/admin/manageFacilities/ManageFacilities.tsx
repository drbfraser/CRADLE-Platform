import { Button } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

import CreateIcon from '@mui/icons-material/Create';
import EditFacility from './EditFacility';
import { Facility } from 'src/shared/types';
import { getHealthFacilitiesAsync } from 'src/shared/api/api';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';
import { useAppDispatch } from 'src/shared/hooks';
import {
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { DataTableHeader } from '../../../shared/components/DataTable/DataTableHeader';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';

export const ManageFacilities = () => {
  const dispatch = useAppDispatch();
  const [errorLoading, setErrorLoading] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState<Facility>();

  const [rows, setRows] = useState<GridRowsProp>([]);
  // Map facility object to row data object.
  const updateRows = (facilities: Facility[]) => {
    setRows(
      facilities.map((facility, index) => ({
        id: index,
        name: facility.name,
        phoneNumber: facility.phoneNumber,
        location: facility.location,
        takeAction: facility,
      }))
    );
  };

  const ActionButtons = useCallback(
    ({ facility }: { facility?: Facility }) => {
      const actions: TableAction[] = [
        {
          tooltip: 'Edit Facility',
          onClick: () => {
            setFacilityToEdit(facility);
            setEditPopupOpen(true);
          },
          Icon: CreateIcon,
        },
      ];
      return <TableActionButtons actions={actions} />;
    },
    [setFacilityToEdit, setEditPopupOpen]
  );

  const columns: GridColDef[] = [
    { flex: 1, field: 'name', headerName: 'Facility Name' },
    { flex: 1, field: 'phoneNumber', headerName: 'Phone Number' },
    { flex: 1, field: 'location', headerName: 'Location' },
    {
      flex: 1,
      field: 'takeAction',
      headerName: 'Take Action',
      filterable: false,
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, Facility>) => (
        <ActionButtons facility={params.value} />
      ),
    },
  ];

  const getFacilities = async () => {
    try {
      const facilities: Facility[] = await getHealthFacilitiesAsync();

      setFacilities(facilities);
      updateRows(facilities);
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getFacilities();
  }, []);

  const editFacility = useCallback(() => {
    setEditPopupOpen(false);
    dispatch(getHealthFacilityList());
    getFacilities();
  }, []);

  const addNewFacility = useCallback(() => {
    setFacilityToEdit(undefined);
    setEditPopupOpen(true);
  }, []);

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <EditFacility
        open={editPopupOpen}
        onClose={editFacility}
        facilities={facilities}
        editFacility={facilityToEdit}
      />
      <DataTableHeader title={'Healthcare Facilities'}>
        <Button
          variant={'contained'}
          startIcon={<AddIcon />}
          onClick={addNewFacility}>
          {'New Facility'}
        </Button>
      </DataTableHeader>
      <DataTable rows={rows} columns={columns} />
    </>
  );
};

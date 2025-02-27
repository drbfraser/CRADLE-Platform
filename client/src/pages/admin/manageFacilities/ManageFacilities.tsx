import { useCallback, useState } from 'react';
import { Button } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import AddIcon from '@mui/icons-material/Add';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { Facility } from 'src/shared/types';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';
import { useAppDispatch } from 'src/shared/hooks';
import { useHealthFacilitiesQuery } from 'src/shared/queries';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import { formatPhoneNumber } from 'src/shared/utils';
import EditFacilityDialog from './EditFacilityDialog';

export const ManageFacilities = () => {
  const dispatch = useAppDispatch();
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState<Facility>();

  const facilitiesQuery = useHealthFacilitiesQuery();
  const facilities = facilitiesQuery.data ?? [];

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

  const tableColumns: GridColDef[] = [
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
  const tableRows = facilities.map((facility, index) => ({
    id: index,
    name: facility.name,
    phoneNumber: formatPhoneNumber(facility.phoneNumber),
    location: facility.location,
    takeAction: facility,
  }));

  const editFacility = () => {
    setEditPopupOpen(false);
    dispatch(getHealthFacilityList());
    facilitiesQuery.refetch();
  };
  const addNewFacility = () => {
    setFacilityToEdit(undefined);
    setEditPopupOpen(true);
  };

  return (
    <>
      {facilitiesQuery.isError && <APIErrorToast />}

      <EditFacilityDialog
        open={editPopupOpen}
        onClose={editFacility}
        facilities={facilities}
        selectedFacility={facilityToEdit}
      />
      <DataTableHeader title="Healthcare Facilities">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addNewFacility}>
          New Facility
        </Button>
      </DataTableHeader>
      <DataTable rows={tableRows} columns={tableColumns} />
    </>
  );
};

import { useCallback, useState } from 'react';
<<<<<<< HEAD
=======
import { useQuery } from '@tanstack/react-query';
>>>>>>> 25143dbc (refactor(admin faciltities list): integrate react query)
import { Button } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import AddIcon from '@mui/icons-material/Add';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { Facility } from 'src/shared/types';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';
import { useAppDispatch } from 'src/shared/hooks';
<<<<<<< HEAD
import { useHealthFacilitiesQuery } from 'src/shared/queries';
=======
>>>>>>> 25143dbc (refactor(admin faciltities list): integrate react query)
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import { formatPhoneNumber } from 'src/shared/utils';
<<<<<<< HEAD
import EditFacilityDialog from './EditFacilityDialog';
=======
import EditFacility from './EditFacility';
>>>>>>> 25143dbc (refactor(admin faciltities list): integrate react query)

export const ManageFacilities = () => {
  const dispatch = useAppDispatch();
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState<Facility>();

<<<<<<< HEAD
  const facilitiesQuery = useHealthFacilitiesQuery();
  const facilities = facilitiesQuery.data ?? [];
=======
  const { data, isError, refetch } = useQuery({
    queryKey: ['healthcareFacilitiesList'],
    queryFn: getHealthFacilitiesAsync,
  });
  const facilities = data ?? [];
>>>>>>> 25143dbc (refactor(admin faciltities list): integrate react query)

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

<<<<<<< HEAD
  const editFacility = () => {
    setEditPopupOpen(false);
    dispatch(getHealthFacilityList());
    facilitiesQuery.refetch();
  };
  const addNewFacility = () => {
=======
  const editFacility = useCallback(() => {
    setEditPopupOpen(false);
    dispatch(getHealthFacilityList());
    refetch();
  }, [dispatch, refetch]);

  const addNewFacility = useCallback(() => {
>>>>>>> 25143dbc (refactor(admin faciltities list): integrate react query)
    setFacilityToEdit(undefined);
    setEditPopupOpen(true);
  };

  return (
    <>
<<<<<<< HEAD
      {facilitiesQuery.isError && <APIErrorToast />}

      <EditFacilityDialog
=======
      {isError && <APIErrorToast />}

      <EditFacility
>>>>>>> 25143dbc (refactor(admin faciltities list): integrate react query)
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
<<<<<<< HEAD
      <DataTable rows={tableRows} columns={tableColumns} />
=======
      <DataTable
        rows={facilities.map((f, index) => ({
          id: index,
          name: f.name,
          phoneNumber: formatPhoneNumber(f.phoneNumber),
          location: f.location,
          takeAction: f,
        }))}
        columns={columns}
      />
>>>>>>> 25143dbc (refactor(admin faciltities list): integrate react query)
    </>
  );
};

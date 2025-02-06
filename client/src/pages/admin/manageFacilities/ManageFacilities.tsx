import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import AddIcon from '@mui/icons-material/Add';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { Facility } from 'src/shared/types';
import { getHealthFacilitiesAsync } from 'src/shared/api/api';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';
import { useAppDispatch } from 'src/shared/hooks';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import { formatPhoneNumber } from 'src/shared/utils';
import EditFacility from './EditFacility';

export const ManageFacilities = () => {
  const dispatch = useAppDispatch();
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState<Facility>();

  const { data, isError, refetch } = useQuery({
    queryKey: ['healthcareFacilitiesList'],
    queryFn: getHealthFacilitiesAsync,
  });
  const facilities = data ?? [];

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

  const editFacility = useCallback(() => {
    setEditPopupOpen(false);
    dispatch(getHealthFacilityList());
    refetch();
  }, [dispatch, refetch]);

  const addNewFacility = useCallback(() => {
    setFacilityToEdit(undefined);
    setEditPopupOpen(true);
  }, []);

  return (
    <>
      {isError && <APIErrorToast />}

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
    </>
  );
};

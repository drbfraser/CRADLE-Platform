import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import {
  AdminTable,
  AdminTableActionButtonsContainer,
  AdminTableToolbar,
  AdminToolBarButton,
} from '../AdminTable';
import CreateIcon from '@mui/icons-material/Create';
import EditFacility from './EditFacility';
import { IFacility } from 'src/shared/types';
import { getHealthFacilitiesAsync } from 'src/shared/api';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';
import { useAppDispatch } from 'src/shared/hooks';
import {
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';

export const ManageFacilities = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [facilities, setFacilities] = useState<IFacility[]>([]);
  const [search, setSearch] = useState('');
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState<IFacility>();

  const [rows, setRows] = useState<GridRowsProp>([]);
  // Map facility object to row data object.
  const updateRows = (facilities: IFacility[]) => {
    setRows(
      facilities.map((facility, index) => ({
        id: index,
        facilityName: facility.healthFacilityName,
        phoneNumber: facility.healthFacilityPhoneNumber,
        location: facility.location,
        takeAction: facility,
      }))
    );
  };

  const ActionButtons = useCallback(
    ({ facility }: { facility?: IFacility }) => {
      return (
        <AdminTableActionButtonsContainer>
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
        </AdminTableActionButtonsContainer>
      );
    },
    [setFacilityToEdit, setEditPopupOpen]
  );

  const columns: GridColDef[] = [
    { flex: 1, field: 'facilityName', headerName: 'FacilityName' },
    { flex: 1, field: 'phoneNumber', headerName: 'Phone Number' },
    { flex: 1, field: 'location', headerName: 'Location' },
    {
      flex: 1,
      field: 'takeAction',
      headerName: 'Take Action',
      renderCell: (params: GridRenderCellParams<any, IFacility>) => (
        <ActionButtons facility={params.value} />
      ),
    },
  ];

  const getFacilities = async () => {
    try {
      const facilities: IFacility[] = await getHealthFacilitiesAsync();

      setFacilities(facilities);
      updateRows(facilities);
      setLoading(false);
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getFacilities();
  }, []);

  // Apply search filter.
  useEffect(() => {
    const searchLowerCase = search.toLowerCase().trim();

    const facilityFilter = (facility: IFacility) => {
      return (
        facility.healthFacilityName.toLowerCase().startsWith(searchLowerCase) ||
        facility.location.toLowerCase().startsWith(searchLowerCase)
      );
    };

    const filteredFacilities = facilities.filter(facilityFilter);
    updateRows(filteredFacilities);
  }, [facilities, search]);

  const editFacility = useCallback(() => {
    setEditPopupOpen(false);
    dispatch(getHealthFacilityList());
    getFacilities();
  }, []);

  const addNewFacility = useCallback(() => {
    setFacilityToEdit(undefined);
    setEditPopupOpen(true);
  }, []);

  const toolbar = (
    <AdminTableToolbar title={'Health Care Facilities'} setSearch={setSearch}>
      <AdminToolBarButton onClick={addNewFacility}>
        <AddIcon /> {'New Facility'}
      </AdminToolBarButton>
    </AdminTableToolbar>
  );

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
      <AdminTable columns={columns} rows={rows} toolbar={toolbar} />
    </>
  );
};

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormControlLabel, Switch } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteForever from '@mui/icons-material/DeleteForever';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

import { Patient } from 'src/shared/types/patientTypes';
import { getPatientsAdminAsync } from 'src/shared/api';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import {
  DataTable,
  DataTableFooter,
} from 'src/shared/components/DataTable/DataTable';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
import ArchivePatientDialog from './ArchivePatientDialog';
import UnarchivePatientDialog from './UnarchivePatientDialog';

export const ManagePatients = () => {
  const [archivePopupOpen, setArchivePopupOpen] = useState(false);
  const [unarchivePopupOpen, setUnarchivePopupOpen] = useState(false);
  const [popupPatient, setPopupPatient] = useState<Patient>();
  const [showArchivedPatients, setShowArchivedPatients] = useState(true);

  const adminPatientListQuery = useQuery({
    queryKey: ['adminPatientList', showArchivedPatients],
    queryFn: () => getPatientsAdminAsync(showArchivedPatients),
  });

  const ActionButtons = useCallback(({ patient }: { patient?: Patient }) => {
    if (!patient) return null;

    const actions: TableAction[] = [];
    if (patient.isArchived) {
      actions.push({
        tooltip: 'Unarchive Patient',
        Icon: RestoreFromTrashIcon,
        onClick: () => {
          setUnarchivePopupOpen(true);
          setPopupPatient(patient);
        },
      });
    } else {
      actions.push({
        tooltip: 'Archive Patient',
        Icon: DeleteForever,
        onClick: () => {
          setArchivePopupOpen(true);
          setPopupPatient(patient);
        },
      });
    }

    return <TableActionButtons actions={actions} />;
  }, []);

  const tableColumns: GridColDef[] = [
    { flex: 1, field: 'patientName', headerName: 'Patient Name' },
    { flex: 1, field: 'patientId', headerName: 'Patient ID' },
    { flex: 1, field: 'isArchived', headerName: 'Archived?' },
    {
      flex: 1,
      field: 'takeAction',
      headerName: 'Take Action',
      filterable: false,
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, Patient>) => (
        <ActionButtons patient={params.value} />
      ),
    },
  ];

  let patients = adminPatientListQuery.data ?? [];
  if (!showArchivedPatients) {
    patients = patients.filter((patient) => !patient.isArchived);
  }
  const tableRows = patients.map((patient) => ({
    id: patient.id,
    patientName: patient.name,
    patientId: patient.id,
    isArchived: patient.isArchived,
    takeAction: patient,
  }));

  const Footer = () => {
    return (
      <DataTableFooter>
        <FormControlLabel
          sx={{ marginX: '10px' }}
          control={
            <Switch
              onClick={() => {
                setShowArchivedPatients(!showArchivedPatients);
                adminPatientListQuery.refetch();
              }}
              checked={showArchivedPatients}
            />
          }
          label="Show Archived Patients"
        />
      </DataTableFooter>
    );
  };

  return (
    <>
      {adminPatientListQuery.isError && <APIErrorToast />}

      {popupPatient && (
        <>
          <ArchivePatientDialog
            open={archivePopupOpen}
            onClose={() => {
              setArchivePopupOpen(false);
              adminPatientListQuery.refetch();
            }}
            patient={popupPatient}
          />
          <UnarchivePatientDialog
            open={unarchivePopupOpen}
            onClose={() => {
              setUnarchivePopupOpen(false);
              adminPatientListQuery.refetch();
            }}
            patient={popupPatient}
          />
        </>
      )}

      <DataTableHeader title="Patients" />
      <DataTable
        columns={tableColumns}
        rows={tableRows}
        footer={Footer}
        getRowClassName={(params) => {
          return params.row.isArchived ? 'row-archived' : '';
        }}
      />
    </>
  );
};

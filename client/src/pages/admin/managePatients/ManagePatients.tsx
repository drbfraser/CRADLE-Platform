import { FormControlLabel, IconButton, Switch, Tooltip } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import {
  AdminTable,
  AdminTableActionButtonsContainer,
  AdminTableToolbar,
} from '../AdminTable';
import DeleteForever from '@mui/icons-material/DeleteForever';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import ArchivePatient from './ArchivePatient';
import UnarchivePatient from './UnarchivePatient';
import { PatientWithIndex } from 'src/shared/types';
import { getPatientsAdminAsync } from 'src/shared/api';
import {
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import {
  DataTable,
  DataTableFooter,
} from 'src/shared/components/DataTable/DataTable';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
export const ManagePatients = () => {
  const [errorLoading, setErrorLoading] = useState(false);
  const [patients, setPatients] = useState<PatientWithIndex[]>([]);
  const [archivePopupOpen, setArchivePopupOpen] = useState(false);
  const [unarchivePopupOpen, setUnarchivePopupOpen] = useState(false);
  const [popupPatient, setPopupPatient] = useState<PatientWithIndex>();
  const [showArchivedPatients, setShowArchivedPatients] = useState(true);

  const [rows, setRows] = useState<GridRowsProp>([]);
  const updateRowData = (patients: PatientWithIndex[]) => {
    setRows(
      patients.map((patient, index) => ({
        id: index,
        patientName: patient.patientName,
        patientId: patient.patientId,
        isArchived: patient.isArchived,
        takeAction: patient,
      }))
    );
  };

  const ActionButtons = useCallback(
    ({ patient }: { patient?: PatientWithIndex }) => {
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
    },
    []
  );

  const columns: GridColDef[] = [
    { flex: 1, field: 'patientName', headerName: 'Patient Name' },
    { flex: 1, field: 'patientId', headerName: 'Patient ID' },
    { flex: 1, field: 'isArchived', headerName: 'Archived?' },
    {
      flex: 1,
      field: 'takeAction',
      headerName: 'Take Action',
      filterable: false,
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, PatientWithIndex>) => (
        <ActionButtons patient={params.value} />
      ),
    },
  ];

  const getPatients = async (showArchivedPatients: boolean) => {
    try {
      const resp: PatientWithIndex[] = await getPatientsAdminAsync(
        showArchivedPatients
      );
      setPatients(resp.map((patient, index) => ({ ...patient, index })));
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getPatients(showArchivedPatients);
  }, [showArchivedPatients]);

  useEffect(() => {
    updateRowData(patients);
  }, [patients]);

  const Footer = () => {
    return (
      <DataTableFooter>
        <FormControlLabel
          style={{
            marginLeft: '10px',
            marginRight: '10px',
          }}
          control={
            <Switch
              onClick={() => setShowArchivedPatients(!showArchivedPatients)}
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
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <ArchivePatient
        open={archivePopupOpen}
        onClose={() => {
          setArchivePopupOpen(false);
          getPatients(showArchivedPatients);
        }}
        patient={popupPatient}
      />
      <UnarchivePatient
        open={unarchivePopupOpen}
        onClose={() => {
          setUnarchivePopupOpen(false);
          getPatients(showArchivedPatients);
        }}
        patient={popupPatient}
      />
      <DataTableHeader title={'Patients'} />
      <DataTable columns={columns} rows={rows} footer={Footer} />
    </>
  );
};

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
export const ManagePatients = () => {
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [patients, setPatients] = useState<PatientWithIndex[]>([]);
  const [search, setSearch] = useState('');
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
      return patient ? (
        <AdminTableActionButtonsContainer>
          {patient.isArchived ? (
            <Tooltip placement="top" title="Unarchive Patient">
              <IconButton
                onClick={() => {
                  setUnarchivePopupOpen(true);
                  setPopupPatient(patient);
                }}
                size="large">
                <RestoreFromTrashIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip placement="top" title="Archive Patient">
              <IconButton
                onClick={() => {
                  setArchivePopupOpen(true);
                  setPopupPatient(patient);
                }}
                size="large">
                <DeleteForever />
              </IconButton>
            </Tooltip>
          )}
        </AdminTableActionButtonsContainer>
      ) : null;
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
      setLoading(false);
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getPatients(showArchivedPatients);
  }, [showArchivedPatients]);

  useEffect(() => {
    const searchLowerCase = search.toLowerCase().trim();

    const patientFilter = (patient: PatientWithIndex) => {
      return (
        patient.patientName.toLowerCase().startsWith(searchLowerCase) ||
        patient.patientId.toLowerCase().startsWith(searchLowerCase)
      );
    };
    const filteredPatients = patients.filter(patientFilter);
    updateRowData(filteredPatients);
  }, [patients, search]);

  const toolbar = (
    <AdminTableToolbar
      title={'Patients'}
      setSearch={setSearch}></AdminTableToolbar>
  );

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
      <AdminTable columns={columns} rows={rows} toolbar={toolbar} />
      <FormControlLabel
        style={{
          marginTop: '10px',
          marginLeft: 'auto',
          marginRight: '10px',
          display: 'flex',
        }}
        control={
          <Switch
            onClick={() => setShowArchivedPatients(!showArchivedPatients)}
            checked={showArchivedPatients}
          />
        }
        label="Show Archived Patients"
      />
    </>
  );
};

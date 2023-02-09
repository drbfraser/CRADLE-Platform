import { FormControlLabel, IconButton, Switch, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import AdminTable from '../AdminTable';
import DeleteForever from '@mui/icons-material/DeleteForever';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import ArchivePatient from './ArchivePatient';
import UnarchivePatient from './UnarchivePatient';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { PatientWithIndex } from 'src/shared/types';
import { getPatientsAdminAsync } from 'src/shared/api';
import { useAdminStyles } from '../adminStyles';
import useMediaQuery from '@mui/material/useMediaQuery';
export const ManagePatients = () => {
  const styles = useAdminStyles();
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [patients, setPatients] = useState<PatientWithIndex[]>([]);
  const [search, setSearch] = useState('');
  const [tableData, setTableData] = useState<(string | number | boolean)[][]>(
    []
  );
  const [archivePopupOpen, setArchivePopupOpen] = useState(false);
  const [unarchivePopupOpen, setUnarchivePopupOpen] = useState(false);
  const [popupPatient, setPopupPatient] = useState<PatientWithIndex>();
  const [showArchivedPatients, setShowArchivedPatients] = useState(true);
  const isTransformed = useMediaQuery('(min-width:800px)');

  const columns = [
    {
      name: 'Patient Name',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Patient ID',
      options: {
        display: isTransformed ? true : false,
      },
    },
    {
      name: 'Archived?',
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
    const rows = patients
      .filter(patientFilter)
      .map((p) => [
        p.patientName,
        p.patientId,
        p.isArchived.toString().toUpperCase(),
        p.index,
      ]);
    setTableData(rows);
  }, [patients, search]);

  const Row = ({ row }: { row: (string | number | boolean)[] }) => {
    const cells = row.slice(0, -1);
    const patient = patients[row.slice(-1)[0] as number];
    return (
      <tr className={styles.row}>
        <TableCell label="Patient Name" isTransformed={isTransformed}>
          {cells[0]}
        </TableCell>
        <TableCell label="Patient Id" isTransformed={isTransformed}>
          {cells[1]}
        </TableCell>
        <TableCell label="Archived?" isTransformed={isTransformed}>
          {cells[2]}
        </TableCell>
        <TableCell label="Take Action" isTransformed={isTransformed}>
          {cells[2] === 'FALSE' ? (
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
          ) : null}
          {cells[2] === 'TRUE' ? (
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
          ) : null}
        </TableCell>
      </tr>
    );
  };

  return (
    <div className={styles.tableContainer}>
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
      <AdminTable
        title="Patients"
        newBtnLabel="New Patient"
        newBtnOnClick={() => {
          setPopupPatient(undefined);
        }}
        search={search}
        setSearch={setSearch}
        columns={columns}
        Row={Row}
        data={tableData}
        loading={loading}
        isTransformed={isTransformed}
      />
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
    </div>
  );
};

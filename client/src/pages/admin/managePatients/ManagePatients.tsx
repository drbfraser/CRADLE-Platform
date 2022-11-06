import { IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import AdminTable from '../AdminTable';
import DeleteForever from '@mui/icons-material/DeleteForever';
import ArchivePatient from './ArchivePatient';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { PatientWithIndex } from 'src/shared/types';
import { getAllPatientsAsync, getPatientInfoAsync } from 'src/shared/api';
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
  const [popupPatient, setPopupPatient] = useState<PatientWithIndex>();
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

  const getPatients = async () => {
    try {
      const resp: PatientWithIndex[] = await getAllPatientsAsync();
      var patientsInfo = new Array();
      for (let i = 0; i < resp.length; i++) {
          let patient = resp[i];
          let patient_info = await getPatientInfoAsync(patient.patientId);
          patientsInfo.push(patient_info);
      }

      setPatients(patientsInfo.map((patient, index) => ({ ...patient, index })));
      // console.log(patientsInfo);
      // patients only updated after clicked once.
      // console.log(patients)
      setLoading(false);
    } catch (e) {
      setErrorLoading(true);
    }
  };

  useEffect(() => {
    getPatients();
  }, []);

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
      .map((p) => [p.patientName, p.patientId, p.isArchived.toString(), p.index]);
    setTableData(rows);
  }, [patients, search]);

  const Row = ({ row }: { row: (string | number | boolean)[] }) => {
    //console.log("row", row);
    const cells = row.slice(0, -1);
    //console.log("cells", cells);
    //console.log("patients", patients)
    const patient = patients[row.slice(-1)[0] as number];
    //console.log("patient", patient);
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
          <Tooltip placement="top" title="Archive Patient">
            <IconButton
              onClick={() => {
                setArchivePopupOpen(true);
                console.log("in onclick");
                console.log("patient", patient)
                setPopupPatient(patient);
                console.log("popupPatient", popupPatient);
              }}
              size="large">
              <DeleteForever />
            </IconButton>
          </Tooltip>
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
          getPatients();
        }}
        patient={popupPatient}
      />
      <AdminTable
        title="Patients"
        newBtnLabel="New Patient"
        newBtnOnClick={() => {
          setPopupPatient(undefined);
          setArchivePopupOpen(true);
        }}
        search={search}
        setSearch={setSearch}
        columns={columns}
        Row={Row}
        data={tableData}
        loading={loading}
        isTransformed={isTransformed}
      />
    </div>
  );
};

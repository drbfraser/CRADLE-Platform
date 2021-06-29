import React, { useState, useEffect } from 'react';
import { MedicalRecord } from 'src/shared/types';
import { apiFetch, API_URL } from 'src/shared/api';
import { Alert } from '@material-ui/lab';
import { EndpointEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { GenericTable } from './genericTable';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

interface IProps {
  patientId: string;
}
const COLUMNS = ['Date', 'Information'];

export const MedicalHistoryTable: React.FC<IProps> = ({ patientId }) => {
  const [medRecords, setMedRecords] = useState<MedicalRecord[]>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.MEDICAL_HISTORY
    )
      .then((resp) => resp.json())
      .then((medRecords) => {
        setMedRecords(medRecords.medical);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

  console.log(medRecords);

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      {errorLoading ? (
        <Alert severity="error">
          Something went wrong trying to loading medical history. Please try
          refreshing.
        </Alert>
      ) : medRecords ? (
        <GenericTable
          rows={medRecords.map((m) => (
            <TableRow key={m.medicalRecordId}>
              <TableCell>{m.dateCreated}</TableCell>
              <TableCell>{m.information}</TableCell>
            </TableRow>
          ))}
          columns={COLUMNS}
        />
      ) : (
        <p>No medical records for this patient</p>
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { MedicalRecord } from 'src/shared/types';
import { Alert } from '@material-ui/lab';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { GenericTable } from './genericTable';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { getPrettyDateTime } from 'src/shared/utils';

interface IProps {
  patientId: string;
}

const COLUMNS = ['Date', 'Information'];

export const DrugHistoryTable: React.FC<IProps> = ({ patientId }) => {
  const [drugRecords, setDrugRecords] = useState<MedicalRecord[]>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.MEDICAL_HISTORY
    )
      .then((resp) => resp.json())
      .then((drugRecords) => {
        setDrugRecords(drugRecords.drug);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

  console.log(drugRecords);

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      {errorLoading ? (
        <Alert severity="error">
          Something went wrong trying to loading drug history. Please try
          refreshing.
        </Alert>
      ) : drugRecords ? (
        <GenericTable
          rows={drugRecords.map((d) => (
            <TableRow key={d.medicalRecordId}>
              <TableCell>{getPrettyDateTime(d.dateCreated)}</TableCell>
              <TableCell>
                {d.information ? d.information : 'No information'}
              </TableCell>
            </TableRow>
          ))}
          columns={COLUMNS}
        />
      ) : (
        <p>No drug records for this patient</p>
      )}
    </>
  );
};

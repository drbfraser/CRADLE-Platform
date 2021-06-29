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
  isDrugRecord: boolean;
  patientId: string;
}

const COLUMNS = ['Date', 'Information'];

export const DrugOrMedHistoryTable: React.FC<IProps> = ({
  isDrugRecord,
  patientId,
}) => {
  const [history, setHistory] = useState<MedicalRecord[]>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.MEDICAL_HISTORY
    )
      .then((resp) => resp.json())
      .then((history) => {
        if (isDrugRecord) setHistory(history.drug);
        else setHistory(history.medical);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId, isDrugRecord]);

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      {errorLoading ? (
        <Alert severity="error">
          Something went wrong when trying to load history. Please try
          refreshing.
        </Alert>
      ) : history ? (
        <GenericTable
          rows={history.map((h) => (
            <TableRow key={h.medicalRecordId}>
              <TableCell>{getPrettyDateTime(h.dateCreated)}</TableCell>
              <TableCell>
                {h.information ? h.information : 'No information'}
              </TableCell>
            </TableRow>
          ))}
          columns={COLUMNS}
        />
      ) : (
        <p>No records for this patient</p>
      )}
    </>
  );
};

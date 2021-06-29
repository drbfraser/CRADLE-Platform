import React, { useState, useEffect } from 'react';
import { MedicalRecord } from 'src/shared/types';
import { Alert } from '@material-ui/lab';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { HistoryTable } from './HistoryTable';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';
import { getPrettyDateTime } from 'src/shared/utils';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

interface IProps {
  isDrugRecord: boolean;
  patientId: string;
}

const colNames = ['Date', 'Information'];

export const DrugOrMedHistoryTable: React.FC<IProps> = ({
  isDrugRecord,
  patientId,
}) => {
  const classes = useRowStyles();
  const theme = useTheme();
  const isTransformed = useMediaQuery(theme.breakpoints.up('sm'));
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
        <HistoryTable
          rows={history.map((h) => (
            <tr className={classes.row} key={h.medicalRecordId}>
              <TableCell label={colNames[0]} isTransformed={isTransformed}>
                {getPrettyDateTime(h.dateCreated)}
              </TableCell>
              <TableCell label={colNames[1]} isTransformed={isTransformed}>
                {h.information ? h.information : 'No information'}
              </TableCell>
            </tr>
          ))}
          columns={colNames}
          isTransformed={isTransformed}
        />
      ) : (
        <p>No records for this patient</p>
      )}
    </>
  );
};

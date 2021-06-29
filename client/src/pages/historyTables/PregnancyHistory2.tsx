import React, { useState, useEffect } from 'react';
import { Pregnancy } from 'src/shared/types';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { Alert } from '@material-ui/lab';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { GenericTable } from './genericTable';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

interface IProps {
  patientId: string;
}
const COLUMNS = ['Start Date (Approx)', 'End Date', 'Length', 'Outcome'];

export const PregnancyHistoryTable: React.FC<IProps> = ({ patientId }) => {
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.PREGNANCY_RECORDS
    )
      .then((resp) => resp.json())
      .then((patient) => {
        setPregnancies(patient);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      {errorLoading ? (
        <Alert severity="error">
          Something went wrong trying to loading pregnancy history. Please try
          refreshing.
        </Alert>
      ) : pregnancies ? (
        <GenericTable
          rows={pregnancies.map((p) => (
            <TableRow key={p.pregnancyId}>
              <TableCell>{p.startDate}</TableCell>
              <TableCell>{p.endDate ? p.endDate : 'Ongoing'}</TableCell>
              <TableCell>{p.endDate ? '8 months' : '4 months'}</TableCell>
              <TableCell>{p.outcome ? p.outcome : 'N/A'}</TableCell>
            </TableRow>
          ))}
          columns={COLUMNS}
        />
      ) : (
        <p>No pregnancy records for this patient</p>
      )}
    </>
  );
};

/*

            <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  {COLUMNS.map((colName) => (
                      <TableCell>
                        {colName}
                      </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pregnancies.map((p) => (
                  <TableRow key={p.pregnancyId}>
                    <TableCell >{p.startDate}</TableCell>
                    <TableCell >{p.endDate ? p.endDate : "Ongoing"}</TableCell>
                    <TableCell >{p.endDate ? "8 months": "4 months"}</TableCell>
                    <TableCell >{p.outcome ? p.outcome : "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
*/

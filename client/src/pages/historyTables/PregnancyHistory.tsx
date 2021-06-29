import React, { useState, useEffect } from 'react';
import { Pregnancy } from 'src/shared/types';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum, GestationalAgeUnitEnum } from 'src/shared/enums';
import { Alert } from '@material-ui/lab';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { GenericTable } from './genericTable';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { InputOnChangeData, Form, Select } from 'semantic-ui-react';
import { getPrettyDateTime } from 'src/shared/utils';
import {
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/shared/constants';

interface IProps {
  isDrugRecord: boolean;
  patientId: string;
}
const COLUMNS = ['Start Date (Approx)', 'End Date', 'Length', 'Outcome'];

export const PregnancyHistoryTable: React.FC<IProps> = ({
  isDrugRecord,
  patientId,
}) => {
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>();
  const [errorLoading, setErrorLoading] = useState(false);
  const [unit, setUnit] = useState(GestationalAgeUnitEnum.MONTHS);

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

  const unitOptions = Object.values(GestationalAgeUnitEnum).map((unit) => ({
    key: unit,
    text: gestationalAgeUnitLabels[unit],
    value: unit,
  }));

  const handleUnitChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ) => {
    setUnit(value as GestationalAgeUnitEnum);
  };

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
        <div>
          <Form.Field
            name="gestationalAgeUnits"
            control={Select}
            options={unitOptions}
            placeholder={gestationalAgeUnitLabels[unit]}
            onChange={handleUnitChange}
          />
          <GenericTable
            rows={pregnancies.map((p) => (
              <TableRow key={p.pregnancyId}>
                <TableCell>{getPrettyDateTime(p.startDate)}</TableCell>
                <TableCell>
                  {p.endDate ? getPrettyDateTime(p.endDate) : 'Ongoing'}
                </TableCell>
                <TableCell>
                  {gestationalAgeUnitFormatters[unit](p!.startDate, p!.endDate)}
                </TableCell>
                <TableCell>{p.outcome ? p.outcome : 'N/A'}</TableCell>
              </TableRow>
            ))}
            columns={COLUMNS}
          />
        </div>
      ) : (
        <p>No pregnancy records for this patient</p>
      )}
    </>
  );
};

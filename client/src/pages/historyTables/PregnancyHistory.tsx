import React, { useState, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import { useHistory } from 'react-router-dom';
import { Pregnancy } from 'src/shared/types';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum, GestationalAgeUnitEnum } from 'src/shared/enums';
import { Alert } from '@material-ui/lab';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { HistoryTable } from './HistoryTable';
import { TableCell } from 'src/shared/components/apiTable/TableCell';
import { InputOnChangeData, Form, Select } from 'semantic-ui-react';
import { getPrettyDateTime } from 'src/shared/utils';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useRowStyles } from 'src/shared/components/apiTable/rowStyles';
import {
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/shared/constants';

interface IProps {
  isDrugRecord: boolean;
  patientId: string;
}
const colNames = ['Start Date (Approx)', 'End Date', 'Length', 'Outcome', 'Edit'];

export const PregnancyHistoryTable: React.FC<IProps> = ({
  isDrugRecord,
  patientId,
}) => {
  const history = useHistory();
  const classes = useRowStyles();
  const theme = useTheme();
  const isTransformed = useMediaQuery(theme.breakpoints.up('sm'));
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
      .then((preg) => {
        setPregnancies(preg);
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
      {errorLoading || !pregnancies ? (
        <Alert severity="error">
          Something went wrong trying to loading pregnancy history. Please try
          refreshing.
        </Alert>
      ) : pregnancies.length > 0 ? (
        <div>
          <Form.Field
            name="gestationalAgeUnits"
            control={Select}
            options={unitOptions}
            placeholder={gestationalAgeUnitLabels[unit]}
            onChange={handleUnitChange}
          />
          <HistoryTable
            rows={pregnancies.map((p) => (
              <tr className={classes.row} key={p.pregnancyId}>
                <TableCell label={colNames[0]} isTransformed={isTransformed}>
                  {getPrettyDateTime(p.startDate)}
                </TableCell>
                <TableCell label={colNames[1]} isTransformed={isTransformed}>
                  {p.endDate ? getPrettyDateTime(p.endDate) : 'Ongoing'}
                </TableCell>
                <TableCell label={colNames[2]} isTransformed={isTransformed}>
                  {gestationalAgeUnitFormatters[unit](p!.startDate, p!.endDate)}
                </TableCell>
                <TableCell label={colNames[3]} isTransformed={isTransformed}>
                  {p.outcome ? p.outcome : 'N/A'}
                </TableCell>
                <TableCell label={colNames[4]} isTransformed={isTransformed}>
                  <IconButton
                    onClick={() => {
                      history.push(`/patients/${patientId}/edit/pregnancyInfo/${p.pregnancyId}`)
                    }}>
                      <CreateIcon/>
                  </IconButton>
                </TableCell>
              </tr>
            ))}
            columns={colNames}
            isTransformed={isTransformed}
          />
        </div>
      ) : (
        <p>No pregnancy records for this patient</p>
      )}
    </>
  );
};

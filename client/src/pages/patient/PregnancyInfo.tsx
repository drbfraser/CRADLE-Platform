import {
  Alert,
  Box,
  Divider,
  Paper,
  Skeleton,
  SxProps,
  TableBody,
  Typography,
} from '@mui/material';
import { Form, InputOnChangeData, Select, TableCell } from 'semantic-ui-react';
import { GestationalAgeUnitEnum, SexEnum } from 'src/shared/enums';
import { Link, useNavigate } from 'react-router-dom';
import { PastPregnancy, PatientPregnancyInfo } from 'src/shared/types';
import React, { useEffect, useState } from 'react';
import {
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/shared/constants';
import { getNumOfWeeksNumeric, getYearToDisplay } from 'src/shared/utils';

import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import { RedirectButton } from 'src/shared/components/Button';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import { getPatientPregnancySummaryAsync } from 'src/shared/api';

interface IProps {
  patientId: string;
  patientName: string;
}

export const PregnancyInfo = ({ patientId, patientName }: IProps) => {
  const navigate = useNavigate();

  const [currentPregnancyUnit, setCurrentPregnancyUnit] = useState(
    GestationalAgeUnitEnum.WEEKS
  );
  const [previousPregnancyUnit, setPreviousPregnancyUnit] = useState(
    GestationalAgeUnitEnum.MONTHS
  );

  const [info, setInfo] = useState<PatientPregnancyInfo>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    const loadPregnancyHistory = async () => {
      try {
        setInfo(await getPatientPregnancySummaryAsync(patientId));
      } catch (e) {
        setErrorLoading(true);
      }
    };

    loadPregnancyHistory();
  }, [patientId]);

  const handleClick = (pregnancyId: string) =>
    navigate(`/patients/${patientId}/edit/pregnancyInfo/${pregnancyId}`);

  const unitOptions = Object.values(GestationalAgeUnitEnum).map((unit) => ({
    key: unit,
    text: gestationalAgeUnitLabels[unit],
    value: unit,
  }));

  const handleCurrentPregnancyUnitChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ) => setCurrentPregnancyUnit(value as GestationalAgeUnitEnum);

  const handlePreviousPregnancyUnitChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ) => setPreviousPregnancyUnit(value as GestationalAgeUnitEnum);

  const CurrentPregnancyStatus = () => {
    const status = info!.isPregnant ? 'Yes' : 'No';

    const isOverdue = info!.isPregnant
      ? getNumOfWeeksNumeric(info!.pregnancyStartDate) > 40
      : false;

    const GestationalAge = () => (
      <p>
        <b>Gestational Age: </b>
        <span style={isOverdue ? { color: 'red' } : {}}>
          {gestationalAgeUnitFormatters[currentPregnancyUnit](
            info!.pregnancyStartDate,
            null
          )}
        </span>
      </p>
    );

    return (
      <Box margin="10px">
        <Box sx={HEADER_SX}>
          <h4>Current Pregnancy</h4>
          <RedirectButton
            url={
              info!.isPregnant
                ? `/patients/${patientId}/edit/pregnancyInfo/${
                    info!.pregnancyId
                  }`
                : `/pregnancies/new/${patientId}`
            }
            size="small">
            {info!.isPregnant ? 'Edit/Close' : 'Add'}
          </RedirectButton>
        </Box>
        <p>
          <b>Pregnant: </b> {status}
        </p>
        {info?.isPregnant && (
          <>
            <GestationalAge />
            <Box sx={HEADER_SX}>
              <b>Gestational Age Unit View: </b>
              <Form.Field
                name="gestationalAgeUnits"
                control={Select}
                options={unitOptions}
                placeholder={gestationalAgeUnitLabels[currentPregnancyUnit]}
                onChange={handleCurrentPregnancyUnitChange}
                sx={{
                  marginLeft: '5px',
                }}
              />
            </Box>
          </>
        )}
        {isOverdue && (
          <Alert severity="warning">
            Long term pregnancy of the patient detected
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <Paper
      sx={{
        backgroundColor: '#fff',
      }}>
      <Box p={3}>
        <Box sx={HEADER_SX}>
          <Typography component="h5" variant="h5">
            <PregnantWomanIcon fontSize="large" />
            Pregnancy Information
          </Typography>
          <Link
            to={
              '/history/' + patientId + '/' + patientName + '/' + SexEnum.FEMALE
            }>
            View Past Records
          </Link>
        </Box>
        <Divider />
        {errorLoading ? (
          <Alert severity="error">
            Something went wrong trying to load patient&rsquo;s pregnancy
            status. Please try refreshing.
          </Alert>
        ) : info ? (
          <>
            <CurrentPregnancyStatus />
            <Divider />
            <Box margin="10px">
              <Box sx={HEADER_SX}>
                <h4> Previous Obstetric History</h4>
                <RedirectButton
                  url={`/pregnancies/new/${patientId}`}
                  size="small">
                  Add
                </RedirectButton>
              </Box>
              <Table
                sx={{
                  clear: 'right',
                }}>
                <TableBody>
                  {info.pastPregnancies && info.pastPregnancies.length > 0 ? (
                    info.pastPregnancies.map(
                      (pastPregnancy: PastPregnancy, index) => (
                        <TableRow
                          hover={true}
                          style={{
                            cursor: 'pointer',
                            height: 40,
                          }}
                          key={pastPregnancy.pregnancyId}
                          onClick={() =>
                            handleClick(pastPregnancy.pregnancyId)
                          }>
                          <TableCell>
                            {getYearToDisplay(pastPregnancy.pregnancyEndDate)}
                          </TableCell>
                          <TableCell>
                            Pregnancy carried to{' '}
                            {gestationalAgeUnitFormatters[
                              previousPregnancyUnit ??
                                GestationalAgeUnitEnum.WEEKS
                            ](
                              pastPregnancy.pregnancyStartDate,
                              pastPregnancy.pregnancyEndDate
                            )}
                          </TableCell>
                          <TableCell>
                            {pastPregnancy.pregnancyOutcome ?? 'N/A'}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <TableRow>No previous pregnancy records</TableRow>
                  )}
                </TableBody>
              </Table>
              {info.pastPregnancies && info.pastPregnancies.length > 0 && (
                <Box sx={HEADER_SX}>
                  <b>Gestational Age Unit View: </b>
                  <Form.Field
                    name="gestationalAgeUnits"
                    control={Select}
                    options={unitOptions}
                    placeholder={
                      gestationalAgeUnitLabels[previousPregnancyUnit]
                    }
                    onChange={handlePreviousPregnancyUnitChange}
                  />
                </Box>
              )}
            </Box>
          </>
        ) : (
          <Skeleton variant="rectangular" height={200} />
        )}
      </Box>
    </Paper>
  );
};

const HEADER_SX: SxProps = {
  display: 'flex',
  marginTop: '10px',
  alignItems: 'center',
  placeContent: 'space-between',
};

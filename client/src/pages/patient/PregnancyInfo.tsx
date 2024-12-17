import {
  Alert,
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  SxProps,
  TableBody,
  TableCell,
  Typography,
} from '@mui/material';
import { GestationalAgeUnitEnum, SexEnum } from 'src/shared/enums';
import { Link, useNavigate } from 'react-router-dom';
import { PastPregnancy, PatientPregnancyInfo } from 'src/shared/types';
import { useEffect, useState } from 'react';
import {
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/shared/constants';
import { getNumOfWeeksNumeric, getYearToDisplay } from 'src/shared/utils';

import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import { RedirectButton } from 'src/shared/components/Button';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import { getPatientPregnancySummaryAsync } from 'src/shared/api/api';

type Props = {
  patientId: string;
  patientName: string;
};

export const PregnancyInfo = ({ patientId, patientName }: Props) => {
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

  const CurrentPregnancyStatus = () => {
    const status = info!.isPregnant ? 'Yes' : 'No';

    const isOverdue = info!.isPregnant
      ? getNumOfWeeksNumeric(info!.pregnancyStartDate) > 40
      : false;

    const GestationalAge = () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.5rem',
          marginY: '6px',
        }}>
        <Typography fontWeight={'bold'}>Gestational Age: </Typography>
        <Typography
          sx={{
            color: isOverdue ? 'red' : null,
          }}>
          {gestationalAgeUnitFormatters[currentPregnancyUnit](
            info!.pregnancyStartDate,
            null
          )}
        </Typography>
      </Box>
    );

    return (
      <Box margin={'10px'}>
        <Box sx={HEADER_SX}>
          <Typography variant={'h6'} component={'h6'} fontWeight={'bold'}>
            Current Pregnancy
          </Typography>
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
        <Stack
          direction={'row'}
          gap={'0.5rem'}
          sx={{ height: '30px', marginY: '6px' }}>
          <Typography fontWeight={'bold'}>Pregnant: </Typography> {status}
        </Stack>
        {info?.isPregnant && (
          <>
            <GestationalAge />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                flexWrap: 'wrap',
                gap: '12px',
                marginY: '6px',
              }}>
              <Typography fontWeight={'bold'}>
                Gestational Age Unit View:{' '}
              </Typography>
              <FormControl>
                <InputLabel id={'current-pregnancy-unit-select-label'}>
                  Gestational Age Unit
                </InputLabel>
                <Select
                  sx={{ width: '160px', height: '40px' }}
                  label={'Gestational Age Unit'}
                  id={'current-pregnancy-unit-select'}
                  name={'current-pregnancy-unit'}
                  value={currentPregnancyUnit}
                  onChange={(event) => {
                    setCurrentPregnancyUnit(
                      event.target.value as GestationalAgeUnitEnum
                    );
                  }}>
                  {unitOptions.map((option) => (
                    <MenuItem key={option.key} value={option.value}>
                      {option.text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </>
        )}
        {isOverdue && (
          <Alert
            severity="warning"
            sx={{
              marginY: '16px',
            }}>
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
                <Typography variant={'h6'} component={'h6'} fontWeight={'bold'}>
                  {' '}
                  Previous Obstetric History
                </Typography>
                <RedirectButton
                  url={`/pregnancies/new/${patientId}`}
                  size="small">
                  Add
                </RedirectButton>
              </Box>
              <Table
                sx={{
                  clear: 'right',
                  width: '100%',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  borderColor: 'lightgrey',
                }}>
                <TableBody>
                  {info.pastPregnancies && info.pastPregnancies.length > 0 ? (
                    info.pastPregnancies.map((pastPregnancy: PastPregnancy) => (
                      <TableRow
                        hover={true}
                        style={{
                          cursor: 'pointer',
                          height: 40,
                        }}
                        key={pastPregnancy.id}
                        onClick={() => handleClick(pastPregnancy.id)}>
                        <TableCell>
                          {getYearToDisplay(pastPregnancy.endDate)}
                        </TableCell>
                        <TableCell>
                          Pregnancy carried to{' '}
                          {gestationalAgeUnitFormatters[
                            previousPregnancyUnit ??
                              GestationalAgeUnitEnum.WEEKS
                          ](pastPregnancy.startDate, pastPregnancy.endDate)}
                        </TableCell>
                        <TableCell>{pastPregnancy.outcome ?? 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell>No previous pregnancy records</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {info.pastPregnancies && info.pastPregnancies.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '20px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}>
                  <Typography fontWeight={'bold'}>
                    Gestational Age Unit View:{' '}
                  </Typography>
                  <FormControl>
                    <InputLabel id={'previous-pregnancy-unit-select-label'}>
                      Gestational Age Unit
                    </InputLabel>
                    <Select
                      sx={{
                        height: '40px',
                        width: '160px',
                      }}
                      id={'previous-pregnancy-unit-select'}
                      labelId={'previous-pregnancy-unit-select'}
                      label={'Gestational Age Unit'}
                      name={'previous-pregnancy-unit'}
                      value={previousPregnancyUnit}
                      onChange={(event) => {
                        setPreviousPregnancyUnit(
                          event.target.value as GestationalAgeUnitEnum
                        );
                      }}>
                      {unitOptions.map((option) => (
                        <MenuItem key={option.key} value={option.value}>
                          {option.text}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
  flexDirection: 'row',
  marginY: '12px',
  alignItems: 'center',
  placeContent: 'space-between',
};

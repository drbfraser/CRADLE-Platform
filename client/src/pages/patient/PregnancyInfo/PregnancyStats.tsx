import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Skeleton,
  TableBody,
  TableCell,
  Typography,
  Table,
  TableRow,
} from '@mui/material';

import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { PastPregnancy } from 'src/shared/types';
import { gestationalAgeUnitFormatters } from 'src/shared/constants';
import { getYearToDisplay } from 'src/shared/utils';
import { getPatientPregnancySummaryAsync } from 'src/shared/api/api';
import { RedirectButton } from 'src/shared/components/Button';
import CurrentPregnancy from './CurrentPregnancy';
import * as Styled from './styled';
import { UNIT_OPTIONS } from './utils';
import {
  createEditPregnancyRoute,
  createNewPregnancyRoute,
} from 'src/app/routes/utils/PatientRoutes';

type Props = {
  patientId: string;
};

const PregnancyStats = ({ patientId }: Props) => {
  const navigate = useNavigate();
  const [previousPregnancyUnit, setPreviousPregnancyUnit] = useState(
    GestationalAgeUnitEnum.MONTHS
  );

  const pregnancyHistoryQuery = useQuery({
    queryKey: ['pregnancyHistory', patientId],
    queryFn: () => getPatientPregnancySummaryAsync(patientId),
  });
  if (pregnancyHistoryQuery.isError) {
    return (
      <Alert severity="error">
        Something went wrong trying to load patient&rsquo;s pregnancy status.
        Please try refreshing.
      </Alert>
    );
  }
  if (pregnancyHistoryQuery.isPending) {
    return <Skeleton variant="rectangular" height={200} />;
  }

  const handleClick = (pregnancyId: string) =>
    navigate(createEditPregnancyRoute(patientId, pregnancyId));

  return (
    <>
      <CurrentPregnancy
        patientId={patientId}
        pregnancyInfo={pregnancyHistoryQuery.data}
      />

      <Divider />

      <Box margin="10px">
        <Styled.Header>
          <Typography variant={'h6'} component={'h6'} fontWeight={'bold'}>
            Previous Obstetric History
          </Typography>
          <RedirectButton url={createNewPregnancyRoute(patientId)} size="small">
            Add
          </RedirectButton>
        </Styled.Header>
        <Table
          sx={{
            clear: 'right',
            width: '100%',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: 'lightgrey',
          }}>
          <TableBody>
            {pregnancyHistoryQuery.data.pastPregnancies.length > 0 ? (
              pregnancyHistoryQuery.data.pastPregnancies.map(
                (pastPregnancy: PastPregnancy) => (
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
                        previousPregnancyUnit ?? GestationalAgeUnitEnum.WEEKS
                      ](pastPregnancy.startDate, pastPregnancy.endDate)}
                    </TableCell>
                    <TableCell>{pastPregnancy.outcome ?? 'N/A'}</TableCell>
                  </TableRow>
                )
              )
            ) : (
              <TableRow>
                <TableCell>No previous pregnancy records</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {pregnancyHistoryQuery.data.pastPregnancies.length > 0 && (
          <Styled.GestationAgeUnitSelectContainer
            sx={{
              marginTop: '2rem',
            }}>
            <Typography fontWeight={'bold'}>
              Gestational Age Unit View:
            </Typography>

            <FormControl>
              <InputLabel id={'previous-pregnancy-unit-select-label'}>
                Gestational Age Unit
              </InputLabel>
              <Styled.GestationAgeUnitSelect
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
                {UNIT_OPTIONS.map((option) => (
                  <MenuItem key={option.key} value={option.value}>
                    {option.text}
                  </MenuItem>
                ))}
              </Styled.GestationAgeUnitSelect>
            </FormControl>
          </Styled.GestationAgeUnitSelectContainer>
        )}
      </Box>
    </>
  );
};

export default PregnancyStats;

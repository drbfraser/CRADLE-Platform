import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TableBody,
  TableCell,
  Typography,
  Table,
  TableRow,
  Stack,
} from '@mui/material';

import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { PastPregnancy } from 'src/shared/types/types';
import { gestationalAgeUnitFormatters } from 'src/shared/constants';
import { getYearToDisplay } from 'src/shared/utils';
import { RedirectButton } from 'src/shared/components/Button';
import * as Styled from '../styled';
import {
  createEditPregnancyRoute,
  createNewPregnancyRoute,
} from 'src/app/routes/utils/PatientRoutes';
import GestationAgeUnitSelect from './GestationAgeUnitSelect';

type Props = {
  patientId: string;
  pastPregnancies: PastPregnancy[];
};

const PregnancyStatsPrevious = ({ patientId, pastPregnancies }: Props) => {
  const navigate = useNavigate();
  const [previousPregnancyUnit, setPreviousPregnancyUnit] = useState(
    GestationalAgeUnitEnum.MONTHS
  );

  const handleClick = (pregnancyId: string) =>
    navigate(createEditPregnancyRoute(patientId, pregnancyId));

  return (
    <Stack margin="10px" gap={'1.5rem'}>
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
          {pastPregnancies.length > 0 ? (
            pastPregnancies.map((pastPregnancy: PastPregnancy) => (
              <TableRow
                style={{
                  cursor: 'pointer',
                  height: 40,
                }}
                hover
                key={pastPregnancy.id}
                onClick={() => handleClick(pastPregnancy.id)}>
                <TableCell>{getYearToDisplay(pastPregnancy.endDate)}</TableCell>
                <TableCell>
                  Pregnancy carried to{' '}
                  {gestationalAgeUnitFormatters[
                    previousPregnancyUnit ?? GestationalAgeUnitEnum.WEEKS
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

      {pastPregnancies.length > 0 && (
        <GestationAgeUnitSelect
          value={previousPregnancyUnit}
          onChange={(event) => {
            setPreviousPregnancyUnit(
              event.target.value as GestationalAgeUnitEnum
            );
          }}
        />
      )}
    </Stack>
  );
};

export default PregnancyStatsPrevious;

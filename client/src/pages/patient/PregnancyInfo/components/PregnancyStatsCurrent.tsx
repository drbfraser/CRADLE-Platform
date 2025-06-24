import { PatientPregnancyInfo } from 'src/shared/types/patientTypes';
import { useState } from 'react';
import { Alert, Box, Stack, Typography } from '@mui/material';

import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { gestationalAgeUnitFormatters } from 'src/shared/constants';
import { getNumOfWeeksNumeric } from 'src/shared/utils';
import { RedirectButton } from 'src/shared/components/Button';
import * as Styled from '../styled';
import {
  createEditPregnancyRoute,
  createNewPregnancyRoute,
} from 'src/app/routes/utils/PatientRoutes';
import GestationAgeUnitSelect from './GestationAgeUnitSelect';

type Props = {
  patientId: string;
  pregnancyInfo: PatientPregnancyInfo;
};

const PregnancyStatsCurrent = ({ patientId, pregnancyInfo }: Props) => {
  const [currentPregnancyUnit, setCurrentPregnancyUnit] = useState(
    GestationalAgeUnitEnum.WEEKS
  );

  const status = pregnancyInfo.isPregnant ? 'Yes' : 'No';

  const isOverdue = pregnancyInfo.isPregnant
    ? getNumOfWeeksNumeric(pregnancyInfo.pregnancyStartDate) > 40
    : false;

  const GestationalAge = () => (
    <Box
      sx={{
        display: 'flex',
        gap: '0.5rem',
      }}>
      <Typography fontWeight={'bold'}>Gestational Age: </Typography>
      <Typography
        sx={{
          color: isOverdue ? 'red' : null,
        }}>
        {gestationalAgeUnitFormatters[currentPregnancyUnit](
          pregnancyInfo.pregnancyStartDate,
          null
        )}
      </Typography>
    </Box>
  );

  return (
    <Stack spacing="1rem" sx={{ margin: '10px' }}>
      {isOverdue && (
        <Alert
          severity="warning"
          sx={{
            margin: '16px',
          }}>
          Long term pregnancy of the patient detected
        </Alert>
      )}

      <Styled.Header>
        <Typography variant={'h6'} component={'h6'} fontWeight={'bold'}>
          Current Pregnancy
        </Typography>
        <RedirectButton
          url={
            pregnancyInfo.isPregnant
              ? createEditPregnancyRoute(patientId, pregnancyInfo.pregnancyId)
              : createNewPregnancyRoute(patientId)
          }
          size="small">
          {pregnancyInfo.isPregnant ? 'Edit/Close' : 'Add'}
        </RedirectButton>
      </Styled.Header>

      <Stack spacing="1rem">
        <Stack direction={'row'} gap={'0.5rem'} sx={{ height: '30px' }}>
          <Typography fontWeight={'bold'}>Pregnant: </Typography> {status}
        </Stack>

        {pregnancyInfo.isPregnant && (
          <>
            <GestationalAge />
            <GestationAgeUnitSelect
              value={currentPregnancyUnit}
              onChange={(event) => {
                setCurrentPregnancyUnit(
                  event.target.value as GestationalAgeUnitEnum
                );
              }}
            />
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default PregnancyStatsCurrent;

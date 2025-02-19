import { PatientPregnancyInfo } from 'src/shared/types';
import { useState } from 'react';
import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';

import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { gestationalAgeUnitFormatters } from 'src/shared/constants';
import { getNumOfWeeksNumeric } from 'src/shared/utils';
import { RedirectButton } from 'src/shared/components/Button';
import * as Styled from './styled';
import {
  createEditPregnancyURL,
  createNewPregnancyURL,
  UNIT_OPTIONS,
} from './utils';

type Props = {
  patientId: string;
  pregnancyInfo: PatientPregnancyInfo;
};

const CurrentPregnancy = ({ patientId, pregnancyInfo }: Props) => {
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
      <Styled.Header>
        <Typography variant={'h6'} component={'h6'} fontWeight={'bold'}>
          Current Pregnancy
        </Typography>
        <RedirectButton
          url={
            pregnancyInfo.isPregnant
              ? createEditPregnancyURL(patientId, pregnancyInfo.pregnancyId)
              : createNewPregnancyURL(patientId)
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
            <Styled.GestationAgeUnitSelectContainer>
              <Typography fontWeight={'bold'}>
                Gestational Age Unit View:
              </Typography>

              <FormControl>
                <InputLabel id={'current-pregnancy-unit-select-label'}>
                  Gestational Age Unit
                </InputLabel>
                <Styled.GestationAgeUnitSelect
                  label={'Gestational Age Unit'}
                  id={'current-pregnancy-unit-select'}
                  name={'current-pregnancy-unit'}
                  value={currentPregnancyUnit}
                  onChange={(event) => {
                    setCurrentPregnancyUnit(
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
          </>
        )}
      </Stack>

      {isOverdue && (
        <Alert
          severity="warning"
          sx={{
            margin: '16px',
          }}>
          Long term pregnancy of the patient detected
        </Alert>
      )}
    </Stack>
  );
};

export default CurrentPregnancy;

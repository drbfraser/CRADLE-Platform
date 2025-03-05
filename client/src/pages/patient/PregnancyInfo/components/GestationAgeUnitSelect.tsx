import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';

import { UNIT_OPTIONS } from '../utils';
import { GestationalAgeUnitEnum } from 'src/shared/enums';

type Props = {
  value: GestationalAgeUnitEnum;
  onChange: (event: SelectChangeEvent<unknown>) => void;
};

const GestationAgeUnitSelect = ({ value, onChange }: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
      <Typography fontWeight={'bold'}>Gestational Age Unit View:</Typography>

      <FormControl>
        <InputLabel id={'gestational-unit-select-label'}>
          Gestational Age Unit
        </InputLabel>
        <Select
          sx={{
            width: '160px',
            height: '40px',
          }}
          id={'gestational-unit-select'}
          label={'Gestational Age Unit'}
          value={value}
          onChange={onChange}>
          {UNIT_OPTIONS.map((option) => (
            <MenuItem key={option.key} value={option.value}>
              {option.text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default GestationAgeUnitSelect;

import { Box, Select, styled } from '@mui/material';

export const Header = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  marginY: '12px',
  alignItems: 'center',
  placeContent: 'space-between',
}));

export const GestationAgeUnitSelectContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
}));
export const GestationAgeUnitSelect = styled(Select)(() => ({
  width: '160px',
  height: '40px',
}));

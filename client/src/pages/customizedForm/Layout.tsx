import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

export const CustomFormPageLayout = () => {
  return (
    <Box sx={{ margin: '0 auto', maxWidth: 1250 }}>
      <Outlet />
    </Box>
  );
};

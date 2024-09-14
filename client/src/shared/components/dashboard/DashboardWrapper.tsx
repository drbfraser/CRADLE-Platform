import Box from '@mui/material/Box';
import { PropsWithChildren } from 'react';

export const DashboardWrapper = ({ children }: PropsWithChildren) => {
  return (
    <Box id={'dashboardContainer'} padding={'24px'}>
      {children}
    </Box>
  );
};

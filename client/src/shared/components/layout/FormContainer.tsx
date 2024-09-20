import { Box } from '@mui/material';
import { PropsWithChildren } from 'react';

// For consistent layout.

type Props = PropsWithChildren;
export const FormContainer = ({ children }: Props) => {
  return (
    <Box
      sx={{
        maxWidth: '1250px',
        margin: '0 auto',
      }}>
      {children}
    </Box>
  );
};

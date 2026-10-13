import { Box } from '@mui/material';
import { PropsWithChildren } from 'react';

export const StatisticGroup = ({ children }: PropsWithChildren) => {
  return (
    <Box
      sx={(theme) => ({
        maxWidth: '1000px',
        marginX: 'auto',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        gap: {
          xs: '12px',
          sm: '24px',
          md: '48px',
        },
        paddingBlockEnd: theme.spacing(2),
        alignItems: 'center',
        justifyContent: 'center',
      })}>
      {children}
    </Box>
  );
};

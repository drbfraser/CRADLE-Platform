import { Box, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';

type DataTableHeaderProps = PropsWithChildren & {
  title: string;
};
export const DataTableHeader = ({ children, title }: DataTableHeaderProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: {
          md: '72px',
          sm: '64px',
          xs: '56px',
        },
        paddingY: {
          xs: '8px',
        },
        paddingX: {
          xs: '8px',
          md: '12px',
          lg: '16px',
        },
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}>
      <Typography variant={'h4'} component={'h4'} sx={{ marginRight: '12px' }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
};

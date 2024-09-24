import { Box, SxProps, Theme } from '@mui/material';

interface TableCellProps {
  children: any;
  label: string;
  isTransformed: boolean;
}

export const TableCell = ({
  children,
  label,
  isTransformed,
}: TableCellProps) => {
  const rootSx: SxProps = {
    padding: '5px 16px',
  };

  const thinSx =
    (label: string): SxProps<Theme> =>
    (theme) => ({
      display: 'flex',
      fontSize: '14px',
      padding: '2px',
      textAlign: 'left',
      marginRight: theme.spacing(1),
      '&:before': {
        content: `"${label}"`,
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        width: '30%',
        minWidth: '132px',
        marginLeft: theme.spacing(2),
      },
    });

  return (
    <Box component="td" sx={isTransformed ? rootSx : thinSx(label)}>
      {children}
    </Box>
  );
};

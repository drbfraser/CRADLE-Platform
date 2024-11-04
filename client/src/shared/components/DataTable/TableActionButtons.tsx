/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  Box,
  IconButton,
  SvgIconTypeMap,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { OverridableComponent } from '@mui/types';

export type TableAction = {
  tooltip: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
    muiName: string;
  };
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};
type TableActionButtonsProps = {
  actions: TableAction[];
};
// Container for table cell with buttons.
export const TableActionButtons = ({ actions }: TableActionButtonsProps) => {
  return (
    <Box
      sx={{
        margin: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: {
          md: '4px',
          xs: '1px',
        },
      }}>
      {actions.map((action) => (
        <TableActionButton key={action.tooltip} {...action} />
      ))}
    </Box>
  );
};

type TableActionButtonProps = TableAction;
export const TableActionButton = ({
  tooltip,
  Icon,
  onClick,
}: TableActionButtonProps) => {
  const theme = useTheme();
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  let buttonSize: 'small' | 'medium' | 'large' = 'large';
  if (isXSmallScreen) {
    buttonSize = 'small';
  } else if (isSmallScreen) {
    buttonSize = 'medium';
  }

  return (
    <Tooltip placement="top" title={tooltip}>
      <IconButton onClick={onClick} size={buttonSize}>
        <Icon
          sx={{
            fontSize: {
              md: '24px',
              sm: '20px',
              xs: '16px',
            },
          }}
        />
      </IconButton>
    </Tooltip>
  );
};

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

const SMALL_ICON = '16px';
const MEDIUM_ICON = '20px';
const LARGE_ICON = '24px';

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
  let iconSize: typeof SMALL_ICON | typeof MEDIUM_ICON | typeof LARGE_ICON =
    LARGE_ICON;
  if (isXSmallScreen) {
    buttonSize = 'small';
    iconSize = SMALL_ICON;
  } else if (isSmallScreen) {
    buttonSize = 'medium';
    iconSize = MEDIUM_ICON;
  }

  return (
    <Tooltip placement="top" title={tooltip}>
      <IconButton onClick={onClick} size={buttonSize}>
        <Icon
          sx={{
            fontSize: iconSize,
          }}
        />
      </IconButton>
    </Tooltip>
  );
};

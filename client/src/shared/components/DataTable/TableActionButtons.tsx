/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Box, IconButton, SvgIconTypeMap, Tooltip } from '@mui/material';
import { OverridableComponent } from '@mui/types';

export type TableAction = {
  tooltip: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
    muiName: string;
  };
  disabled?: boolean;
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
        justifyContent: 'start',
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

const BUTTON_SIZE = {
  md: '32px',
  sm: '26px',
  xs: '22px',
} as const;

const ICON_SIZE = {
  md: '24px',
  sm: '20px',
  xs: '16px',
} as const;

type TableActionButtonProps = TableAction;
export const TableActionButton = ({
  tooltip,
  Icon,
  disabled,
  onClick,
}: TableActionButtonProps) => {
  return (
    <Tooltip placement="top" title={tooltip}>
      <IconButton
        sx={{
          height: BUTTON_SIZE,
          width: BUTTON_SIZE,
        }}
        onClick={onClick}
        disabled={disabled}>
        <Icon
          sx={{
            fontSize: ICON_SIZE,
          }}
        />
      </IconButton>
    </Tooltip>
  );
};

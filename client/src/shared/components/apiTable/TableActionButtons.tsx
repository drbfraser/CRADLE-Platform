/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Box, IconButton, SvgIconTypeMap, Tooltip } from '@mui/material';
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
        marginX: 'auto',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
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
  return (
    <Tooltip placement="top" title={tooltip}>
      <IconButton onClick={onClick} size="large">
        <Icon />
      </IconButton>
    </Tooltip>
  );
};

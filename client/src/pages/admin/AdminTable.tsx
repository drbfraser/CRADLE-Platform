import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridValidRowModel,
} from '@mui/x-data-grid';

import { PrimaryButton } from 'src/shared/components/Button';
import {
  Box,
  TableContainer,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { MouseEventHandler, PropsWithChildren, ReactNode } from 'react';

type AdminToolbarProps = {
  rows: readonly GridValidRowModel[];
  columns: GridColDef[];
  toolbar?: ReactNode;
};

export const AdminTable = ({ rows, columns, toolbar }: AdminToolbarProps) => {
  return (
    <AdminTableContainer>
      <DataGrid
        sx={{
          border: '0',
        }}
        rows={rows}
        columns={columns}
        autosizeOnMount
        autosizeOptions={{
          includeHeaders: true,
          includeOutliers: true,
        }}
        pagination
        slots={{
          toolbar: () => toolbar,
        }}
      />
    </AdminTableContainer>
  );
};

const AdminTableContainer = ({ children }: PropsWithChildren) => {
  return (
    <TableContainer
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '600px',
        maxHeight: '600px',
        '& .MuiTableCell-head': {
          fontWeight: 'bold',
        },
        '& button': {
          fontWeight: 'bold',
        },
      }}>
      {children}
    </TableContainer>
  );
};

const TOOLBAR_ELEMENT_HEIGHT_LARGE = '56px';
const TOOLBAR_ELEMENT_HEIGHT_SMALL = '40px';
const TOOLBAR_ELEMENT_SX = {
  '@media (min-width: 900px)': {
    height: TOOLBAR_ELEMENT_HEIGHT_LARGE,
  },
  '@media (max-width: 900px)': {
    height: TOOLBAR_ELEMENT_HEIGHT_SMALL,
  },
};
const MAX_BUTTON_WIDTH = '230px';
const TOOLBAR_BUTTON_SX = {
  maxWidth: MAX_BUTTON_WIDTH,
  '@media (max-width: 720px)': {
    width: MAX_BUTTON_WIDTH,
  },
  '@media (max-width: 360px)': {
    fontSize: '0',
    width: '100%',
    maxWidth: MAX_BUTTON_WIDTH,
  },
  ...TOOLBAR_ELEMENT_SX,
};

type ToolbarProps = PropsWithChildren & {
  title?: string;
  search?: string;
  setSearch: (val: string) => void;
};
export const AdminTableToolbar = ({
  children,
  title,
  setSearch,
}: ToolbarProps) => {
  const isTransformed = useMediaQuery('(min-width:900px)');
  return (
    <GridToolbarContainer
      sx={{
        padding: '16px',
      }}>
      <Typography variant="h3">{title}</Typography>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={TOOLBAR_ELEMENT_SX}>
        <TextField
          type="text"
          variant="outlined"
          sx={TOOLBAR_ELEMENT_SX}
          size={isTransformed ? 'medium' : 'small'}
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      {children}
    </GridToolbarContainer>
  );
};

type ToolbarButtonProps = PropsWithChildren & {
  onClick?: MouseEventHandler;
};
export const AdminToolBarButton = ({
  children,
  onClick,
}: ToolbarButtonProps) => {
  return (
    <PrimaryButton sx={TOOLBAR_BUTTON_SX} onClick={onClick}>
      {children}
    </PrimaryButton>
  );
};

// Container for table cell with buttons.
export const AdminTableActionButtonsContainer = ({
  children,
}: PropsWithChildren) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justify: 'center',
        gap: '4px',
      }}>
      {children}
    </Box>
  );
};

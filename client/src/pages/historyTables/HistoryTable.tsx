import { Box, Typography } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridValidRowModel,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridFooterContainer,
} from '@mui/x-data-grid';
import { PropsWithChildren } from 'react';

type HistoryTableProps = {
  rows?: readonly GridValidRowModel[];
  columns: GridColDef[];
  toolbar?: () => JSX.Element;
  footer?: () => JSX.Element;
};
export const HistoryTable = ({
  rows,
  columns,
  toolbar,
  footer,
}: HistoryTableProps) => {
  return (
    <Box>
      <DataGrid
        rows={rows}
        columns={columns}
        autosizeOnMount
        autosizeOptions={{
          includeHeaders: true,
          includeOutliers: true,
        }}
        pagination
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        slots={{
          toolbar: toolbar,
          footer: footer,
        }}
      />
    </Box>
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
const TOOLBAR_SLOT_PROPS = {
  button: {
    sx: {
      ...TOOLBAR_BUTTON_SX,
      '@media (min-width: 720px)': {
        fontSize: 'large',
      },
      '@media (max-width: 720px)': {
        fontSize: 'medium',
      },
      '@media (max-width: 520px)': {
        fontSize: 'x-small',
      },
    },
  },
};

type DataTableToolbarProps = PropsWithChildren & {
  title: string;
};
export const DataTableToolbar = ({
  children,
  title,
}: DataTableToolbarProps) => {
  return (
    <GridToolbarContainer
      sx={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <Typography variant="h4">{title}</Typography>
      <Box
        sx={{
          marginX: '8px',
          display: 'flex',
          flexDirection: 'row',
          gap: '4px',
          '@media (max-width: 520px)': {
            gap: '0',
          },
        }}>
        <GridToolbarColumnsButton slotProps={TOOLBAR_SLOT_PROPS} />
        <GridToolbarFilterButton slotProps={TOOLBAR_SLOT_PROPS} />
        <GridToolbarDensitySelector slotProps={TOOLBAR_SLOT_PROPS} />
        {children}
      </Box>
    </GridToolbarContainer>
  );
};

type DataTableFooterProps = PropsWithChildren;
export const DataTableFooter = ({ children }: DataTableFooterProps) => {
  return (
    <GridFooterContainer
      sx={{
        padding: '16px',
      }}>
      {children}
    </GridFooterContainer>
  );
};

import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridValidRowModel,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridFooterContainer,
  GridPagination,
} from '@mui/x-data-grid';
import { PropsWithChildren } from 'react';

type HistoryTableProps = {
  rows?: readonly GridValidRowModel[];
  columns: GridColDef[];
  listColumns?: GridColDef[]; // Alternate column definition to use on very small screens.
  toolbar?: () => JSX.Element;
  footer?: () => JSX.Element;
};
export const HistoryTable = ({
  rows,
  columns,
  listColumns,
  toolbar,
  footer = () => <DataTableFooter />,
}: HistoryTableProps) => {
  const theme = useTheme();
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const listView = Boolean(listColumns && isXSmallScreen);
  return (
    <Box>
      <DataGrid
        rows={rows}
        columns={listView ? listColumns! : columns}
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

const TOOLBAR_ELEMENT_HEIGHT_MED = '56px';
const TOOLBAR_ELEMENT_HEIGHT_SMALL = '40px';
const TOOLBAR_ELEMENT_HEIGHT_X_SMALL = '36px';
const TOOLBAR_SLOT_PROPS = {
  button: {
    sx: {
      height: {
        md: TOOLBAR_ELEMENT_HEIGHT_MED,
        sm: TOOLBAR_ELEMENT_HEIGHT_SMALL,
        xs: TOOLBAR_ELEMENT_HEIGHT_X_SMALL,
      },
      fontSize: {
        lg: 'large',
        md: 'medium',
        sm: 'small',
        xs: 'x-small',
      },
    },
  },
};

type DataTableToolbarProps = PropsWithChildren & {
  title: string;
};
export const DataTableToolbar = ({ title }: DataTableToolbarProps) => {
  return (
    <GridToolbarContainer
      sx={{
        height: 'fit',
        width: '100%',
        padding: '16px',
        display: 'flex',
        flexDirection: {
          sm: 'row',
          xs: 'column',
        },
        alignItems: {
          sm: 'center',
          xs: 'stretch',
        },
        justifyContent: {
          sm: 'space-between',
          xs: 'center',
        },
      }}>
      <Typography
        variant={'h4'}
        component={'h4'}
        sx={{
          fontSize: {
            md: 'xx-large',
            sm: 'x-large',
            xs: 'large',
          },
          marginRight: '8px',
        }}>
        {title}
      </Typography>
      <Box
        sx={{
          height: {
            md: TOOLBAR_ELEMENT_HEIGHT_MED,
            sm: TOOLBAR_ELEMENT_HEIGHT_SMALL,
            xs: TOOLBAR_ELEMENT_HEIGHT_X_SMALL,
          },
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: {
            sm: 'row',
          },
          alignItems: 'center',
          gap: {
            xs: '4px',
          },
        }}>
        <GridToolbarColumnsButton slotProps={TOOLBAR_SLOT_PROPS} />
        <GridToolbarFilterButton slotProps={TOOLBAR_SLOT_PROPS} />
        <GridToolbarDensitySelector slotProps={TOOLBAR_SLOT_PROPS} />
      </Box>
    </GridToolbarContainer>
  );
};

type DataTableFooterProps = PropsWithChildren;
export const DataTableFooter = ({ children }: DataTableFooterProps) => {
  return (
    <GridFooterContainer
      sx={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      {children}
      <GridPagination
        sx={{
          marginLeft: 'auto',
        }}
      />
    </GridFooterContainer>
  );
};

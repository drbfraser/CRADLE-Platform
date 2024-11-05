import { Box, SxProps } from '@mui/material';
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
  useGridApiRef,
  GridRowClassNameParams,
} from '@mui/x-data-grid';
import { PropsWithChildren, useEffect } from 'react';

const DATA_TABLE_BORDER_COLOR = 'rgb(224, 224, 224)';

const autosizeOptions = {
  includeHeaders: true,
  includeOutliers: true,
} as const;

type DataTableProps = {
  rows?: readonly GridValidRowModel[];
  columns: GridColDef[];
  toolbar?: () => JSX.Element;
  footer?: () => JSX.Element;
  sx?: SxProps;
  getRowClassName?: (params: GridRowClassNameParams<any>) => string;
};
export const DataTable = ({
  rows,
  columns,
  toolbar = () => <DataTableToolbar />,
  footer = () => <DataTableFooter />,
  sx,
  getRowClassName,
}: DataTableProps) => {
  const apiRef = useGridApiRef();

  useEffect(() => {
    apiRef.current.autosizeColumns(autosizeOptions);
  }, [rows, apiRef]);

  return (
    <Box
      sx={{
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        autosizeOnMount
        autosizeOptions={autosizeOptions}
        pagination
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        slots={{
          toolbar: toolbar,
          footer: footer,
        }}
        sx={{
          minHeight: '400px',
          maxWidth: '100%',
          overflow: 'hidden',
          borderTop: '1px solid',
          borderColor: DATA_TABLE_BORDER_COLOR,
          borderRadius: '0',
          '& .MuiDataGrid-topContainer': {
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: DATA_TABLE_BORDER_COLOR,
          },
          ...sx,
        }}
        getRowClassName={getRowClassName}
      />
    </Box>
  );
};

const TOOLBAR_SLOT_PROPS = {
  button: {
    sx: {
      fontSize: {
        lg: 'large',
        md: 'medium',
        sm: 'small',
        xs: 'x-small',
      },
    },
  },
};
type DataTableToolbarProps = PropsWithChildren;
export const DataTableToolbar = ({ children }: DataTableToolbarProps) => {
  return (
    <GridToolbarContainer
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderRadius: '0px',
        borderColor: DATA_TABLE_BORDER_COLOR,
        padding: '4px',
      }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: {
            sm: 'row',
          },
          alignItems: 'center',
          gap: {
            xs: '4px',
          },
          justifyContent: 'start',
        }}>
        <GridToolbarColumnsButton slotProps={TOOLBAR_SLOT_PROPS} />
        <GridToolbarFilterButton slotProps={TOOLBAR_SLOT_PROPS} />
        <GridToolbarDensitySelector slotProps={TOOLBAR_SLOT_PROPS} />
      </Box>
      {children}
    </GridToolbarContainer>
  );
};

type DataTableFooterProps = PropsWithChildren & {
  sx?: SxProps;
};
export const DataTableFooter = ({ children, sx }: DataTableFooterProps) => {
  return (
    <GridFooterContainer
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        ...sx,
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

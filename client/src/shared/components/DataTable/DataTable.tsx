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
  GridPagination,
  useGridApiRef,
} from '@mui/x-data-grid';
import { PropsWithChildren, RefObject, useEffect } from 'react';

const autosizeOptions = {
  includeHeaders: true,
  includeOutliers: true,
} as const;

type DataTableProps = {
  rows?: readonly GridValidRowModel[];
  columns: GridColDef[];
  toolbar?: () => JSX.Element;
  footer?: () => JSX.Element;
};
export const DataTable = ({
  rows,
  columns,
  toolbar,
  footer = () => <DataTableFooter />,
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
        loading={rows?.length == 0}
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
          maxWidth: '100%',
          overflow: 'hidden',
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

type DataTableToolbarProps = {
  title: string;
};
export const DataTableToolbar = ({ title }: DataTableToolbarProps) => {
  return (
    <GridToolbarContainer
      sx={{
        width: '100%',
        padding: '16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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

type ContainerMeasurementsProps = {
  containerRef: RefObject<HTMLDivElement>;
};
const ContainerMeasurements = ({
  containerRef,
}: ContainerMeasurementsProps) => {};

declare module 'mui-datatables' {
  import * as React from 'react';

  export type Display = 'true' | 'false' | 'excluded';
  export type SortDirection = 'asc' | 'desc';
  export type FilterType =
    | 'dropdown'
    | 'checkbox'
    | 'multiselect'
    | 'textField'
    | 'custom';
  export type Responsive = `standard` | `vertical` | `simple`;
  export type SelectableRows = 'multiple' | 'single' | 'none';

  export interface MUIDataTableData {
    data: Array<Record<string, unknown> | number[] | string[]>;
    index: number;
  }

  export interface MUIDataTableStateRows {
    data: string[];
    lookup: any;
  }

  export interface MUIDataTableState {
    activeColumn: string | null;
    announceText: string | null;
    columns: MUIDataTableColumnState[];
    count: number;
    data: any[];
    displayData: Array<{ dataIndex: number; data: any[] }>;
    expandedRows: MUIDataTableStateRows;
    filterData: any[];
    filterList: string[][];
    page: number;
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    searchText: string | null;
    selectedRows: MUIDataTableStateRows;
    showResponsive: boolean;
  }

  export interface MUIDataTableMeta {
    columnData: MUIDataTableColumnState;
    columnIndex: number;
    rowData: any[];
    rowIndex: number;
    tableData: MUIDataTableData[];
    tableState: MUIDataTableState;
  }

  export interface MUIDataTableCustomHeadRenderer extends MUIDataTableColumn {
    index: number;
  }

  export interface MUIDataTableTextLabelsBody {
    noMatch: string;
    toolTip: string;
  }

  export interface MUIDataTableTextLabelsPagination {
    displayRows: string;
    next: string;
    previous: string;
    rowsPerPage: string;
  }

  export interface MUIDataTableTextLabelsToolbar {
    downloadCsv: string;
    filterTable: string;
    print: string;
    search: string;
    viewColumns: string;
  }

  export interface MUIDataTableTextLabelsFilter {
    all: string;
    reset: string;
    title: string;
  }

  export interface MUIDataTableTextLabelsViewColumns {
    title: string;
    titleAria: string;
  }

  export interface MUIDataTableTextLabelsSelectedRows {
    delete: string;
    deleteAria: string;
    text: string;
  }

  export interface MUIDataTableColumn {
    label?: string;
    name: string;
    options?: MUIDataTableColumnOptions;
  }

  export interface MUIDataTableTextLabels {
    body: Partial<MUIDataTableTextLabelsBody>;
    filter: Partial<MUIDataTableTextLabelsFilter>;
    pagination: Partial<MUIDataTableTextLabelsPagination>;
    selectedRows: Partial<MUIDataTableTextLabelsSelectedRows>;
    toolbar: Partial<MUIDataTableTextLabelsToolbar>;
    viewColumns: Partial<MUIDataTableTextLabelsViewColumns>;
  }

  export interface MUIDataTableFilterOptions {
    names?: string[];
    display?: (
      filterList: string[],
      onChange: any,
      index: number,
      column: any
    ) => void;
    logic?: (prop: string, filterValue: any[]) => boolean;
  }

  export interface MUIDataTableCustomFilterListOptions {
    render?: (value: any) => React.ReactNode;
    update?: (...args: any[]) => string[];
  }

  export interface MUIDataTableColumnState extends MUIDataTableColumnOptions {
    name: string;
    label?: string;
  }

  export interface MUIDataTableColumnOptions {
    customBodyRender?: (
      value: any,
      tableMeta: MUIDataTableMeta,
      updateValue: (value: string) => void
    ) => string | React.ReactNode;
    customHeadRender?: (
      columnMeta: MUIDataTableCustomHeadRenderer,
      updateDirection: (params: any) => any
    ) => string | React.ReactNode;
    customFilterListRender?: (value: any) => string;
    customFilterListOptions?: MUIDataTableCustomFilterListOptions;
    display?: 'true' | 'false' | 'excluded';
    download?: boolean;
    empty?: boolean;
    filter?: boolean;
    filterType?: FilterType;
    filterList?: string[];
    filterOptions?: MUIDataTableFilterOptions;
    hint?: string;
    print?: boolean;
    searchable?: boolean;
    setCellHeaderProps?: (
      columnMeta: MUIDataTableCustomHeadRenderer
    ) => Record<string, unknown>;
    setCellProps?: (
      cellValue: string,
      rowIndex: number,
      columnIndex: number
    ) => Record<string, unknown>;
    sort?: boolean;
    sortDirection?: 'asc' | 'desc' | 'none';
    viewColumns?: boolean;
  }

  export interface MUIDataTableIsRowCheck {
    lookup: {
      dataIndex: number;
    };
    data: [
      {
        index: number;
        dataIndex: number;
      }
    ];
  }

  export interface MUIDataTableOptions {
    caseSensitive?: boolean;
    count?: number;
    customFilterDialogFooter?: (filterList: any[]) => React.ReactNode;
    customFooter?: (
      rowCount: number,
      page: number,
      rowsPerPage: number,
      changeRowsPerPage: (page: string | number) => void,
      changePage: (newPage: number) => void
    ) => React.ReactNode;
    customRowRender?: (
      data: any[],
      dataIndex: number,
      rowIndex: number
    ) => React.ReactNode;
    customSearch?: (
      searchQuery: string,
      currentRow: any[],
      columns: any[]
    ) => boolean;
    customSearchRender?: (
      searchText: string,
      handleSearch: any,
      hideSearch: any,
      options: any
    ) => React.Component | JSX.Element;
    customSort?: (data: any[], colIndex: number, order: string) => any[];
    customToolbar?: () => React.ReactNode;
    customToolbarSelect?: (
      selectedRows: {
        data: Array<{ index: number; dataIndex: number }>;
        lookup: { [key: number]: boolean };
      },
      displayData: Array<{ data: any[]; dataIndex: number }>,
      setSelectedRows: (rows: number[]) => void
    ) => React.ReactNode;
    disableToolbarSelect?: boolean;
    download?: boolean;
    downloadOptions?: Partial<{
      filename: string;
      separator: string;
      filterOptions: Partial<{
        useDisplayedColumnsOnly: boolean;
        useDisplayedRowsOnly: boolean;
      }>;
    }>;
    elevation?: number;
    expandableRows?: boolean;
    expandableRowsOnClick?: boolean;
    filter?: boolean;
    filterType?: FilterType;
    fixedHeader?: boolean;
    fixedHeaderOptions?: {
      xAxis: boolean;
      yAxis: boolean;
    };
    isRowExpandable?: (
      dataIndex: number,
      expandedRows?: MUIDataTableIsRowCheck
    ) => boolean;
    isRowSelectable?: (
      dataIndex: number,
      selectedRows?: MUIDataTableIsRowCheck
    ) => boolean;
    onCellClick?: (
      colData: any,
      cellMeta: {
        colIndex: number;
        rowIndex: number;
        dataIndex: number;
        event: React.MouseEvent;
      }
    ) => void;
    onChangePage?: (currentPage: number) => void;
    onChangeRowsPerPage?: (numberOfRows: number) => void;
    onColumnSortChange?: (changedColumn: string, direction: string) => void;
    onColumnViewChange?: (changedColumn: string, action: string) => void;
    /**
     * A callback function that triggers when the user downloads the CSV file.
     * In the callback, you can control what is written to the CSV file.
     * Return false to cancel download of file.
     */
    onDownload?: (
      buildHead: (columns: any) => string,
      buildBody: (data: any) => string,
      columns: any,
      data: any
    ) => string | boolean;
    onFilterChange?: (
      changedColumn: string,
      filterList: any[],
      type: FilterType | 'chip' | 'reset'
    ) => void;
    onFilterDialogOpen?: () => void;
    onFilterDialogClose?: () => void;
    onRowClick?: (
      rowData: string[],
      rowMeta: { dataIndex: number; rowIndex: number }
    ) => void;
    onRowsDelete?: (rowsDeleted: {
      lookup: { [dataIndex: number]: boolean };
      data: Array<{ index: number; dataIndex: number }>;
    }) => void;
    onRowsExpand?: (currentRowsExpanded: any[], allRowsExpanded: any[]) => void;
    onRowsSelect?: (currentRowsSelected: any[], rowsSelected: any[]) => void;
    onSearchChange?: (searchText: string) => void;
    onSearchOpen?: () => void;
    onSearchClose?: () => void;
    onTableChange?: (action: string, tableState: MUIDataTableState) => void;
    onTableInit?: (action: string, tableState: MUIDataTableState) => void;
    page?: number;
    pagination?: boolean;
    print?: boolean;
    renderExpandableRow?: (
      rowData: string[],
      rowMeta: { dataIndex: number; rowIndex: number }
    ) => React.ReactNode;
    resizableColumns?: boolean;
    responsive?: Responsive;
    rowHover?: boolean;
    rowsPerPage?: number;
    rowsPerPageOptions?: number[];
    rowsExpanded?: any[];
    rowsSelected?: any[];
    search?: boolean;
    searchOpen?: boolean;
    searchPlaceholder?: string;
    searchText?: string;
    selectableRows?: SelectableRows;
    selectableRowsHeader?: boolean;
    selectableRowsOnClick?: boolean;
    setTableProps?: () => Record<string, unknown>;
    serverSide?: boolean;
    serverSideFilterList?: any[];
    setRowProps?: (row: any[], rowIndex: number) => Record<string, unknown>;
    sort?: boolean;
    sortFilterList?: boolean;
    textLabels?: Partial<MUIDataTableTextLabels>;
    viewColumns?: boolean;
  }

  export type MUIDataTableColumnDef = string | MUIDataTableColumn;

  export interface MUIDataTableProps {
    columns: MUIDataTableColumnDef[];
    data: Array<Record<string, unknown> | number[] | string[]>;
    options?: MUIDataTableOptions;
    title: string | React.ReactNode;
  }

  export interface MUIDataTablePopover {
    action?: (...args: any) => any;
    anchorEl?: React.ReactNode;
    anchorOrigin?: any;
    elevation?: number;
    onClose?: (...args: any) => any;
    onExited?: (...args: any) => any;
    option?: boolean;
    ref?: any;
    transformOrigin?: any;
  }

  export interface MUIDataTableBody {
    classes: Record<string, unknown>;
    columns: MUIDataTableColumnDef[];
    count: number;
    data: Array<Record<string, unknown> | number[] | string[]>;
    filterList?: string[][];
    onRowClick?: (
      rowData: string[],
      rowMeta: { dataIndex: number; rowIndex: number }
    ) => void;
    options: Record<string, unknown>;
    searchText?: string;
    selectRowUpdate?: (...args: any) => any;
    selectedRows?: Record<string, unknown>;
    toggleExpandRow?: (...args: any) => any;
  }

  export interface MUIDataTableBodyCell {
    children?: any;
    className?: string;
    classes?: Record<string, unknown>;
    colIndex?: number;
    columnHeader?: any;
    dataIndex?: number;
    options?: Record<string, unknown>;
    otherProps?: any;
    rowIndex?: number;
  }

  export interface MUIDataTableBodyRow {
    className?: string;
    classes?: Record<string, unknown>;
    onClick?: (...args: any) => any;
    options: Record<string, unknown>;
    rowSelected?: boolean;
  }

  export interface MUIDataTableFilter {
    classes?: Record<string, unknown>;
    filterData: any[];
    filterList?: string[][];
    onFilterRest?: (...args: any) => any;
    onFilterUpdate?: (...args: any) => any;
    options: Record<string, unknown>;
  }

  export interface MUIDataTableFilterList {
    classes?: Record<string, unknown>;
    filterList: string[][];
    onFilterUpdate?: (...args: any) => any;
  }

  export interface MUIDataTableFooter {
    changePage?: any;
    changeRowsPerPage?: (...args: any) => any;
    options?: Record<string, unknown>;
    page?: number;
    rowCount?: number;
    rowsPerPage?: number;
  }

  export interface MUIDataTableHead {
    classes?: Record<string, unknown>;
    columns?: MUIDataTableColumnDef[];
    count?: number;
    data?: any[];
    options?: Record<string, unknown>;
    page?: any;
    selectedRows?: any;
    setCellRef?: any;
  }

  export interface MUIDataTableHeadCell {
    children?: any;
    classes?: Record<string, unknown>;
    hint: string;
    options: Record<string, unknown>;
    sort: boolean;
    sortDirection?: SortDirection;
    toggleSort: (...args: any) => any;
  }

  export interface MUIDataTableHeadRow {
    classes?: Record<string, unknown>;
  }

  export interface MUIDataTablePagination {
    changeRowsPerPage: (...args: any) => any;
    count: number;
    options: Record<string, unknown>;
    page: number;
    rowsPerPage: number;
  }

  export interface MUIDataTableResize {
    classes?: Record<string, unknown>;
    options?: Record<string, unknown>;
    rowSelected?: boolean;
    setResizeable?: (...args: any) => any;
    updateDividers?: (...args: any) => any;
  }

  export interface MUIDataTableSearch {
    classes?: Record<string, unknown>;
    onHide?: (...args: any) => any;
    onSearch?: (...args: any) => any;
    options?: Record<string, unknown>;
  }

  export interface MUIDataTableSelectCell {
    checked: boolean;
    classes?: Record<string, unknown>;
    expandableOn?: boolean;
    fixedHeader: boolean;
    isHeaderCell?: boolean;
    isRowExpanded?: boolean;
    isRowSelectable?: boolean;
    onChange?: (...args: any) => any;
    onExpand?: (...args: any) => any;
    otherProps?: any;
    selectableOn?: boolean;
  }

  export interface MUIDataTableToolbar {
    classes?: Record<string, unknown>;
    columns: MUIDataTableColumnDef[];
    data?: any[];
    filterData?: any;
    filterList?: string[][];
    filterUpdate?: any;
    options?: Record<string, unknown>;
    resetFilters?: any;
    searchTextUpdate?: (...args: any) => any;
    setTableActions?: (...args: any) => any;
    tableRef?: (...args: any) => any;
    title?: any;
    toggleViewColumn?: any;
  }

  export interface MUIDataTableToolbarSelect {
    classes?: Record<string, unknown>;
    displayData?: any;
    onRowsDelete?: (...args: any) => any;
    options: Record<string, unknown>;
    rowSelected?: boolean;
    selectRowUpdate?: (...args: any) => any;
  }

  export interface MUIDataTableViewCol {
    classes?: Record<string, unknown>;
    columns: any[];
    object: Record<string, unknown>;
    onColumnUpdate: (...args: any) => any;
  }

  export const MUIDataTable: React.ComponentType<MUIDataTableProps>;

  export const Popover: React.Component<MUIDataTablePopover>;
  export const TableBody: React.Component<MUIDataTableBody>;
  export const TableBodyCell: React.Component<MUIDataTableBodyCell>;
  export const TableBodyRow: React.Component<MUIDataTableBodyRow>;
  export const TableFilter: React.Component<MUIDataTableFilter>;
  export const TableFilterList: React.Component<MUIDataTableFilterList>;
  export const TableFooter: React.Component<MUIDataTableFooter>;
  export const TableHead: React.Component<MUIDataTableHead>;
  export const TableHeadCell: React.Component<MUIDataTableHeadCell>;
  export const TableHeadRow: React.Component<MUIDataTableHeadRow>;
  export const TablePagination: React.Component<MUIDataTablePagination>;
  export const TableResize: React.Component<MUIDataTableResize>;
  export const TableSearch: React.Component<MUIDataTableSearch>;
  export const TableSelectCell: React.Component<MUIDataTableSelectCell>;
  export const TableToolbar: React.Component<MUIDataTableToolbar>;
  export const TableToolbarSelect: React.Component<MUIDataTableToolbarSelect>;
  export const TableViewCol: React.Component<MUIDataTableViewCol>;

  export default MUIDataTable;
}

import { DeleteForever } from '@mui/icons-material';
import {
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { useDialogs } from '@toolpad/core';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { deleteMedicalRecordAsync } from 'src/shared/api';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import { MedicalRecord } from 'src/shared/types';
import { getPrettyDate } from 'src/shared/utils';
import { DataTableToolbar, HistoryTable } from './HistoryTable';

type RouteParams = {
  patientId: string;
};

type MedicalHistoryProps = {
  title: string;
  fetchRecords: (patientId: string) => Promise<MedicalRecord[]>;
};
export const MedicalHistory = ({
  title,
  fetchRecords,
}: MedicalHistoryProps) => {
  const { patientId } = useParams<RouteParams>();
  const [rows, setRows] = useState<GridRowsProp>();
  const dialogs = useDialogs();

  const updateRowData = (records: MedicalRecord[]) => {
    setRows(
      records.map((record) => ({
        id: record.medicalRecordId,
        dateCreated: getPrettyDate(record.dateCreated),
        information: record.information,
        takeAction: record,
      }))
    );
  };

  const ActionButtons = useCallback(
    ({ record }: { record?: MedicalRecord }) => {
      const actions: TableAction[] = [
        {
          tooltip: 'Delete Record',
          Icon: DeleteForever,
          onClick: async () => {
            if (!record || !patientId) return;
            const confirmed = await dialogs.confirm(
              'Are you sure you want to delete this record? This action cannot be reversed.',
              {
                okText: 'Delete Record',
                cancelText: 'Cancel',
                severity: 'warning',
              }
            );

            if (confirmed) {
              const response = await deleteMedicalRecordAsync(record);
              if (response.ok) {
                await dialogs.alert('Medical record successfully deleted.');
                getRowData();
              } else {
                const responseBody = await response.json();
                await dialogs.alert(
                  `Error: Medical record could not be deleted.\n${responseBody}`
                );
              }
            }
          },
        },
      ];
      return record ? <TableActionButtons actions={actions} /> : null;
    },
    []
  );

  const columns: GridColDef[] = [
    {
      field: 'dateCreated',
      headerName: 'Date',
      flex: 1,
      sortable: true,
    },
    {
      field: 'information',
      headerName: 'Information',
      flex: 2,
      sortable: false,
    },
    {
      field: 'takeAction',
      headerName: 'Take Action',
      headerAlign: 'center',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (
        params: GridRenderCellParams<GridValidRowModel, MedicalRecord>
      ) => <ActionButtons record={params.value} />,
    },
  ];

  const getRowData = async () => {
    if (!patientId) return;
    try {
      const data = await fetchRecords(patientId);
      updateRowData(data);
    } catch (e) {
      if (e instanceof Response) {
        const error = await e.json();
        console.error(error);
      } else {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    getRowData();
  }, []);

  const TableToolbar = () => <DataTableToolbar title={title} />;

  return <HistoryTable rows={rows} columns={columns} toolbar={TableToolbar} />;
};

import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DeleteForever } from '@mui/icons-material';
import {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { useDialogs } from '@toolpad/core';

import { deleteMedicalRecordAsync } from 'src/shared/api/api';
import { MedicalRecord } from 'src/shared/types';
import { getPrettyDate } from 'src/shared/utils';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import { DataTable } from 'src/shared/components/DataTable/DataTable';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
import { useMutation, useQuery } from '@tanstack/react-query';

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
  const dialogs = useDialogs();

  const { data: medicalRecordsData, refetch } = useQuery({
    queryKey: [`patientMedicalRecords`, title, patientId],
    queryFn: async () => {
      if (!patientId) {
        throw new Error('Patient ID not defined');
      }
      return fetchRecords(patientId);
    },
  });

  const { mutate: deleteRecord } = useMutation({
    mutationFn: (record: MedicalRecord) => deleteMedicalRecordAsync(record),
  });

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
              deleteRecord(record, {
                onSuccess: () => {
                  dialogs.alert('Medical record successfully deleted.');
                  refetch();
                },
                onError: (e) =>
                  dialogs.alert(
                    `Error: Medical record could not be deleted.\n${e}`
                  ),
              });
            }
          },
        },
      ];
      return record ? <TableActionButtons actions={actions} /> : null;
    },
    [deleteRecord, dialogs, patientId, refetch]
  );

  const rows =
    medicalRecordsData?.map((r) => ({
      id: r.id,
      dateCreated: getPrettyDate(r.dateCreated),
      information: r.information,
      takeAction: r,
    })) ?? [];
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

  return (
    <>
      <DataTableHeader title={title} />
      <DataTable rows={rows} columns={columns} />
    </>
  );
};

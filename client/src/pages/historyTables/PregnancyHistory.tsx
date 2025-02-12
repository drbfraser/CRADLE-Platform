import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { DeleteForever } from '@mui/icons-material';
import CreateIcon from '@mui/icons-material/Create';
import {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { useDialogs } from '@toolpad/core';

import {
  deletePregnancyAsync,
  getPatientPregnanciesAsync,
} from 'src/shared/api/api';
import { Pregnancy } from 'src/shared/types';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import {
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/shared/constants';
import { getPrettyDate } from 'src/shared/utils';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/DataTable/TableActionButtons';
import {
  DataTableFooter,
  DataTable,
} from 'src/shared/components/DataTable/DataTable';
import { DataTableHeader } from 'src/shared/components/DataTable/DataTableHeader';
import { useMutation, useQuery } from '@tanstack/react-query';

const UNIT_OPTIONS = Object.values(GestationalAgeUnitEnum).map((unit) => ({
  key: unit,
  text: gestationalAgeUnitLabels[unit],
  value: unit,
}));

type RouteParams = {
  patientId: string;
};

export const PregnancyHistory = () => {
  const { patientId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const dialogs = useDialogs();

  const [unit, setUnit] = useState(GestationalAgeUnitEnum.MONTHS);
  const handleUnitChange = (
    event: SelectChangeEvent<GestationalAgeUnitEnum>
  ) => {
    const value = event.target.value;
    setUnit(value as GestationalAgeUnitEnum);
  };

  const { data: pregnancyData, refetch } = useQuery({
    queryKey: ['patientPregnancies', patientId],
    queryFn: () => getPatientPregnanciesAsync(patientId!),
    enabled: !!patientId,
  });
  const { mutate: deletePregnancy } = useMutation({
    mutationFn: (pregnancy: Pregnancy) => deletePregnancyAsync(pregnancy),
  });

  const ActionButtons = useCallback(
    ({ pregnancy }: { pregnancy?: Pregnancy }) => {
      const actions: TableAction[] = [
        {
          tooltip: 'Edit/Close Pregnancy',
          Icon: CreateIcon,
          onClick: () => {
            if (pregnancy && patientId) {
              navigate(
                `/patients/${patientId}/edit/pregnancyInfo/${pregnancy.id}`
              );
            }
          },
        },
        {
          tooltip: 'Delete Pregnancy',
          Icon: DeleteForever,
          onClick: async () => {
            if (!pregnancy) return;

            const confirmed = await dialogs.confirm(
              'Are you sure you want to delete this pregnancy? This action cannot be reversed.',
              {
                okText: 'Delete Pregnancy',
                cancelText: 'Cancel',
                severity: 'warning',
              }
            );
            if (confirmed) {
              deletePregnancy(pregnancy, {
                onSuccess: () => {
                  dialogs.alert('Pregnancy successfully deleted.');
                  refetch();
                },
                onError: (e) =>
                  dialogs.alert(`Error: Pregnancy could not be deleted.\n${e}`),
              });
            }
          },
        },
      ];
      return pregnancy ? <TableActionButtons actions={actions} /> : null;
    },
    [deletePregnancy, dialogs, navigate, patientId, refetch]
  );

  const tableRows = useMemo(
    () =>
      pregnancyData?.map((p) => ({
        id: p.id,
        startDate: getPrettyDate(p.startDate),
        endDate: p.endDate ? getPrettyDate(p.endDate) : 'Ongoing',
        gestation: gestationalAgeUnitFormatters[
          unit ?? GestationalAgeUnitEnum.WEEKS
        ](p.startDate, p.endDate),
        outcome: p.outcome,
        takeAction: p,
      })) ?? [],
    [pregnancyData, unit]
  );
  const columns: GridColDef[] = [
    {
      field: 'startDate',
      headerName: 'Start Date (Approx)',
      flex: 0.5,
      sortable: true,
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      flex: 0.5,
      sortable: true,
    },
    {
      field: 'gestation',
      headerName: 'Gestation',
      flex: 1,
      sortable: false,
    },
    {
      field: 'outcome',
      headerName: 'Outcome',
      flex: 1,
      sortable: false,
    },
    {
      field: 'takeAction',
      headerName: 'Take Action',
      headerAlign: 'center',
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (
        params: GridRenderCellParams<GridValidRowModel, Pregnancy>
      ) => <ActionButtons pregnancy={params.value} />,
    },
  ];

  const GestationalAgeUnitSelect = () => {
    return (
      <FormControl
        sx={{
          height: '36px',
          width: '150px',
          marginLeft: '8px',
        }}>
        <InputLabel id="gestational-age-unit-select-label">
          Gestational Age Units
        </InputLabel>
        <Select
          sx={{
            height: '100%',
          }}
          value={unit}
          label="Gestational Age Unit"
          labelId="gestational-age-unit-select-label"
          id="gestational-age-unit-select"
          onChange={handleUnitChange}>
          {UNIT_OPTIONS.map((option) => (
            <MenuItem key={option.key} value={option.value}>
              {option.text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <>
      <DataTableHeader title="Pregnancies" />
      <DataTable
        rows={tableRows}
        columns={columns}
        footer={() => (
          <DataTableFooter>
            <GestationalAgeUnitSelect />
          </DataTableFooter>
        )}
      />
    </>
  );
};

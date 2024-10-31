import {
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { DataTableToolbar, HistoryTable } from './HistoryTable';
import { useNavigate, useParams } from 'react-router-dom';
import {
  API_URL,
  deletePregnancyAsync,
  getPatientPregnanciesAsync,
} from 'src/shared/api';
import { useCallback, useEffect, useState } from 'react';
import { Pregnancy } from 'src/shared/types';
import {
  TableAction,
  TableActionButtons,
} from 'src/shared/components/apiTable/TableActionButtons';
import CreateIcon from '@mui/icons-material/Create';
import { DeleteForever } from '@mui/icons-material';
import { useDialogs } from '@toolpad/core';
import { getPrettyDate } from 'src/shared/utils';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import {
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/shared/constants';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';

type RouteParams = {
  patientId: string;
};

export const PregnancyHistory = () => {
  const { patientId } = useParams<RouteParams>();
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [rows, setRows] = useState<GridRowsProp>();
  const navigate = useNavigate();
  const dialogs = useDialogs();

  const [unit, setUnit] = useState(GestationalAgeUnitEnum.MONTHS);

  const unitOptions = Object.values(GestationalAgeUnitEnum).map((unit) => ({
    key: unit,
    text: gestationalAgeUnitLabels[unit],
    value: unit,
  }));

  const updateRowData = (pregnancies: Pregnancy[]) => {
    setRows(
      pregnancies.map((pregnancy) => ({
        id: pregnancy.pregnancyId,
        startDate: getPrettyDate(pregnancy.startDate),
        endDate: pregnancy.endDate
          ? getPrettyDate(pregnancy.endDate)
          : 'Ongoing',
        gestation: gestationalAgeUnitFormatters[
          unit ?? GestationalAgeUnitEnum.WEEKS
        ](pregnancy.startDate, pregnancy.endDate),
        outcome: pregnancy.outcome,
        takeAction: pregnancy,
      }))
    );
  };

  const handleUnitChange = (
    event: SelectChangeEvent<GestationalAgeUnitEnum>
  ) => {
    const value = event.target.value;
    setUnit(value as GestationalAgeUnitEnum);
  };

  const ActionButtons = useCallback(
    ({ pregnancy }: { pregnancy?: Pregnancy }) => {
      const actions: TableAction[] = [
        {
          tooltip: 'Edit/Close Pregnancy',
          Icon: CreateIcon,
          onClick: () => {
            if (!pregnancy || !patientId) return;
            const { pregnancyId } = pregnancy;
            // Navigate to edit page.
            navigate(
              `${API_URL}/patients/${patientId}/edit/pregnancyInfo/${pregnancyId}`
            );
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
              const response = await deletePregnancyAsync(pregnancy);
              if (response.ok) {
                await dialogs.alert('Pregnancy successfully deleted.');
              } else {
                const responseBody = await response.json();
                await dialogs.alert(
                  `Error: Pregnancy could not be deleted.\n${responseBody}`
                );
              }
            }
          },
        },
      ];
      return pregnancy ? <TableActionButtons actions={actions} /> : null;
    },
    [patientId]
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
      <FormControl>
        <InputLabel id="gestational-age-unit-select-label">
          Gestational Age Units
        </InputLabel>
        <Select
          sx={{
            width: '150px',
          }}
          value={unit}
          label={'Gestational Age Unit'}
          labelId={'gestational-age-unit-select-label'}
          id={'gestational-age-unit-select'}
          onChange={handleUnitChange}>
          {unitOptions.map((option) => (
            <MenuItem key={option.key} value={option.value}>
              {option.text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const TableToolbar = () => {
    return (
      <DataTableToolbar title={'Pregnancy History'}>
        <GestationalAgeUnitSelect />
      </DataTableToolbar>
    );
  };

  const getRowData = async () => {
    if (!patientId) return;
    try {
      const data = await getPatientPregnanciesAsync(patientId);
      setPregnancies(data);
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

  // Update the rows whenever the unit changes or the pregnancies.
  useEffect(() => {
    updateRowData(pregnancies);
  }, [unit, pregnancies]);

  return <HistoryTable rows={rows} columns={columns} toolbar={TableToolbar} />;
};

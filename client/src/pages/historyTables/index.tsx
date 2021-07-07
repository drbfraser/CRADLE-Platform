import React, { useState } from 'react';
import { Tab, InputOnChangeData, Form, Select } from 'semantic-ui-react';
import { useRouteMatch } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { APITable } from 'src/shared/components/apiTable';
import {
  EndpointEnum,
  GestationalAgeUnitEnum,
  SexEnum,
} from 'src/shared/enums';
import { gestationalAgeUnitLabels } from 'src/shared/constants';
import { debounce } from 'lodash';
import {
  PREGNANCY_RECORD_COLUMNS,
  MEDICAL_RECORD_COLUMNS,
  SORTABLE_MEDICAL_RECORD_COLUMNS,
  SORTABLE_PREGNANCY_RECORD_COLUMNS,
} from './constants';
import { MedicalRecordRow } from './MedicalRecordRow';
import { PregnancyRecordRow } from './PregnancyRecordRow';
import { goBackWithFallback } from 'src/shared/utils';

type RouteParams = {
  patientId: string;
  patientName: string;
  patientSex: SexEnum;
};

export function HistoryTablesPage() {
  const { patientId, patientName, patientSex } =
    useRouteMatch<RouteParams>().params;
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const [unit, setUnit] = useState(GestationalAgeUnitEnum.MONTHS);

  const debounceSetSearch = debounce(setSearch, 500);

  const isTransformed = useMediaQuery(`(min-width:560px)`);

  const unitOptions = Object.values(GestationalAgeUnitEnum).map((unit) => ({
    key: unit,
    text: gestationalAgeUnitLabels[unit],
    value: unit,
  }));

  const handleUnitChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ) => {
    setUnit(value as GestationalAgeUnitEnum);
  };

  const allPanes = [
    {
      name: 'Pregnancy History',
      COLUMNS: PREGNANCY_RECORD_COLUMNS,
      endpoint:
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.PREGNANCY_RECORDS,
      RowComponent: PregnancyRecordRow,
      rowKey: 'pregnancyId',
      initialSortBy: 'startDate',
      isDrugRecord: undefined,
      SORTABLE_COLUMNS: SORTABLE_PREGNANCY_RECORD_COLUMNS,
      index: 0,
      searchText: 'Outcome',
    },
    {
      name: 'Medical History',
      COLUMNS: {
        dateCreated: 'Date',
        information: 'Information',
      },
      endpoint:
        EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.MEDICAL_HISTORY,
      RowComponent: MedicalRecordRow,
      rowKey: 'medicalRecordId',
      initialSortBy: 'dateCreated',
      isDrugRecord: false,
      SORTABLE_COLUMNS: SORTABLE_MEDICAL_RECORD_COLUMNS,
      index: 1,
      searchText: 'Information',
    },
    {
      name: 'Drug History',
      COLUMNS: MEDICAL_RECORD_COLUMNS,
      endpoint:
        EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.MEDICAL_HISTORY,
      RowComponent: MedicalRecordRow,
      rowKey: 'medicalRecordId',
      initialSortBy: 'dateCreated',
      isDrugRecord: true,
      SORTABLE_COLUMNS: SORTABLE_MEDICAL_RECORD_COLUMNS,
      index: 2,
      searchText: 'Information',
    },
  ];

  const panes = (
    patientSex === SexEnum.MALE
      ? allPanes.filter((obj) => obj.name !== 'Pregnancy History')
      : allPanes
  ).map((p) => ({
    menuItem: p.name,
    render: () => (
      <Tab.Pane key={p.index} className={classes.wrapper}>
        <div className={classes.topWrapper}>
          <TextField
            className={classes.search}
            label="Search"
            placeholder={p.searchText}
            variant="outlined"
            onChange={(e) => debounceSetSearch(e.target.value)}
          />
          {p.name === 'Pregnancy History' && (
            <>
              <Form.Field
                name="gestationalAgeUnits"
                control={Select}
                options={unitOptions}
                placeholder={gestationalAgeUnitLabels[unit]}
                onChange={handleUnitChange}
                className={
                  isTransformed ? classes.selectField : classes.selectFieldSmall
                }
              />
              {!isTransformed && <br />}
            </>
          )}
        </div>
        <div className={classes.table}>
          <APITable
            endpoint={p.endpoint}
            search={search}
            columns={p.COLUMNS}
            sortableColumns={p.SORTABLE_COLUMNS}
            rowKey={p.rowKey}
            initialSortBy={p.initialSortBy}
            RowComponent={p.RowComponent}
            isTransformed={isTransformed}
            isDrugRecord={p.isDrugRecord}
            gestationalAgeUnit={unit}
            patientId={patientId}
          />
        </div>
      </Tab.Pane>
    ),
  }));

  return (
    <div>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback(`/patients/${patientId ?? ''}`)}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">Past Records of {patientName}</Typography>
      </div>
      <Tab
        menu={{
          secondary: true,
          pointing: true,
          className: classes.tabs,
        }}
        panes={panes}
      />
    </div>
  );
}

const useStyles = makeStyles({
  tabs: {
    display: 'fluid',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  search: {
    width: '225px',
  },
  selectField: {
    float: 'right',
  },
  selectFieldSmall: {
    display: 'inline-block',
    marginTop: '20px',
  },
  topWrapper: {
    padding: 15,
  },
  wrapper: {
    backgroundColor: '#fff',
  },
  table: {
    clear: 'right',
  },
  title: {
    display: `flex`,
    alignItems: `center`,
  },
});

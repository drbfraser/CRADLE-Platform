import React, { useState } from 'react';
import { Tab, InputOnChangeData, Form, Select, Menu } from 'semantic-ui-react';
import { useRouteMatch } from 'react-router-dom';
import { Typography, Paper, Box } from '@material-ui/core';
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
import { HistoryTimeline } from './HistoryTimeline';
import { SortDir } from 'src/shared/components/apiTable/types';

type RouteParams = {
  patientId: string;
  patientName: string;
  patientSex: SexEnum;
};

enum HistoryViewOption {
  TABLE = 'table',
  TIMELINE = 'timeline',
}

export function HistoryTablesPage() {
  const { patientId, patientName, patientSex } =
    useRouteMatch<RouteParams>().params;
  const classes = useStyles();
  const [viewSelected, setViewSelected] = useState(HistoryViewOption.TABLE);
  const [pregnancySearch, setPregnancySearch] = useState('');
  const [medicalHistorySearch, setMedicalHistorySearch] = useState('');
  const [drugHistorySearch, setDrugHistorySearch] = useState('');
  const [unit, setUnit] = useState(GestationalAgeUnitEnum.WEEKS);

  const debounceSetPregnancySearch = debounce(setPregnancySearch, 500);
  const debounceSetMedicalHistorySearch = debounce(
    setMedicalHistorySearch,
    500
  );
  const debounceSetDrugHistorySearch = debounce(setDrugHistorySearch, 500);

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
      initialSortDir: SortDir.DESC,
      isDrugRecord: undefined,
      SORTABLE_COLUMNS: SORTABLE_PREGNANCY_RECORD_COLUMNS,
      index: 0,
      searchText: 'Outcome',
      search: pregnancySearch,
      debounceSetSearch: debounceSetPregnancySearch,
    },
    {
      name: 'Medical History',
      COLUMNS: {
        dateCreated: 'Date',
        information: 'Information',
      },
      endpoint:
        EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.MEDICAL_RECORDS,
      RowComponent: MedicalRecordRow,
      rowKey: 'medicalRecordId',
      initialSortBy: 'dateCreated',
      initialSortDir: SortDir.DESC,
      isDrugRecord: false,
      SORTABLE_COLUMNS: SORTABLE_MEDICAL_RECORD_COLUMNS,
      index: 1,
      searchText: 'Information',
      search: medicalHistorySearch,
      debounceSetSearch: debounceSetMedicalHistorySearch,
    },
    {
      name: 'Drug History',
      COLUMNS: MEDICAL_RECORD_COLUMNS,
      endpoint:
        EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.MEDICAL_RECORDS,
      RowComponent: MedicalRecordRow,
      rowKey: 'medicalRecordId',
      initialSortBy: 'dateCreated',
      initialSortDir: SortDir.DESC,
      isDrugRecord: true,
      SORTABLE_COLUMNS: SORTABLE_MEDICAL_RECORD_COLUMNS,
      index: 2,
      searchText: 'Information',
      search: drugHistorySearch,
      debounceSetSearch: debounceSetDrugHistorySearch,
    },
  ];

  const filteredPanes =
    patientSex === SexEnum.MALE
      ? allPanes.filter((obj) => obj.name !== 'Pregnancy History')
      : allPanes;

  const panes = filteredPanes.map((p) => ({
    menuItem: p.name,
    render: () => (
      <Tab.Pane key={p.index} className={classes.wrapper}>
        <div className={classes.topWrapper}>
          <TextField
            className={classes.search}
            label="Search"
            placeholder={p.searchText}
            variant="outlined"
            name={p.search}
            onChange={(e) => p.debounceSetSearch(e.target.value)}
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
            search={p.search}
            columns={p.COLUMNS}
            sortableColumns={p.SORTABLE_COLUMNS}
            rowKey={p.rowKey}
            initialSortBy={p.initialSortBy}
            initialSortDir={p.initialSortDir}
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
      <Menu fluid widths={2}>
        <Menu.Item
          name="Table View"
          active={viewSelected === HistoryViewOption.TABLE}
          onClick={() => setViewSelected(HistoryViewOption.TABLE)}
        />
        <Menu.Item
          name="Timeline View"
          active={viewSelected === HistoryViewOption.TIMELINE}
          onClick={() => setViewSelected(HistoryViewOption.TIMELINE)}
        />
      </Menu>
      <div>
        {viewSelected === HistoryViewOption.TABLE && (
          <Paper>
            <Box p={3}>
              <Tab
                menu={{
                  secondary: true,
                  pointing: true,
                  className: classes.tabs,
                }}
                panes={panes}
                //Set search state value of the new active tab to empty
                onTabChange={(_, tabProps) => {
                  filteredPanes[
                    Number(tabProps.activeIndex!)
                  ].debounceSetSearch('');
                }}
              />
            </Box>
          </Paper>
        )}
        {viewSelected === HistoryViewOption.TIMELINE && (
          <HistoryTimeline
            patientId={patientId}
            isTransformed={isTransformed}
          />
        )}
      </div>
    </div>
  );
}

const useStyles = makeStyles({
  tabs: {
    display: 'fluid',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  outerTabs: {
    display: 'fluid',
    alignItems: 'center',
    justifyContent: 'center',
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

import React, { useState } from 'react';
import { Tab, InputOnChangeData, Form, Select } from 'semantic-ui-react';
import { useRouteMatch } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Paper from '@material-ui/core/Paper';
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

type RouteParams = {
  patientId: string;
  patientSex: SexEnum;
};

export function HistoryTablesPage() {
  const { patientId, patientSex } = useRouteMatch<RouteParams>().params;
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const [unit, setUnit] = useState(GestationalAgeUnitEnum.MONTHS);

  const debounceSetSearch = debounce(setSearch, 500);

  const isBigScreen = useMediaQuery('(min-width:440px)');
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
    },
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
    },
  ];
  const panes = allPanes.map((p) =>
    p.name === 'Pregnancy History' && patientSex === SexEnum.MALE
      ? {}
      : {
          menuItem: p.name,
          render: () => (
            <Paper className={classes.wrapper}>
              <div className={classes.topWrapper}>
                <h5 className={classes.title}>{p.name}</h5>

                {p.name === 'Pregnancy History' && (
                  <>
                    <br />
                    <Form.Field
                      name="gestationalAgeUnits"
                      control={Select}
                      options={unitOptions}
                      placeholder={gestationalAgeUnitLabels[unit]}
                      onChange={handleUnitChange}
                      className={classes.title}
                    />
                  </>
                )}

                <TextField
                  className={isBigScreen ? classes.search : classes.searchThin}
                  label="Search"
                  placeholder="Search"
                  variant="outlined"
                  onChange={(e) => debounceSetSearch(e.target.value)}
                />
              </div>
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
            </Paper>
          ),
        }
  );

  return (
    <div>
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
    float: 'right',
  },
  title: {
    display: 'inline-block',
  },
  searchThin: {
    display: 'block',
    marginLeft: 1,
  },
  topWrapper: {
    padding: 15,
  },
  wrapper: {
    backgroundColor: '#fff',
  },
});

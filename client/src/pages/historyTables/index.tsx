import React, { useState } from 'react';
import { Tab, InputOnChangeData, Form, Select } from 'semantic-ui-react';
import { useRouteMatch } from 'react-router-dom';
import { Typography, Box } from '@material-ui/core';
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
import { MedicalRecord, Pregnancy } from 'src/shared/types';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import { apiFetch, API_URL } from 'src/shared/api';
import { Toast } from 'src/shared/components/toast';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

type RouteParams = {
  patientId: string;
  patientName: string;
  patientSex: SexEnum;
};

export function HistoryTablesPage() {
  const { patientId, patientName, patientSex } =
    useRouteMatch<RouteParams>().params;
  const classes = useStyles();
  const [pregnancySearch, setPregnancySearch] = useState('');
  const [medicalHistorySearch, setMedicalHistorySearch] = useState('');
  const [drugHistorySearch, setDrugHistorySearch] = useState('');
  const [unit, setUnit] = useState(GestationalAgeUnitEnum.MONTHS);

  const [popupMedicalRecord, setPopupMedicalRecord] = useState<MedicalRecord>();
  const [popupPregnancyRecord, setPopupPregnancyRecord] = useState<Pregnancy>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<boolean>(false);

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

  const handleDeleteRecord = async () => {
    const universalRecordId = popupPregnancyRecord
      ? popupPregnancyRecord.pregnancyId
      : popupMedicalRecord
      ? popupMedicalRecord.medicalRecordId
      : '';
    const endpoint = popupPregnancyRecord
      ? EndpointEnum.PREGNANCIES
      : EndpointEnum.MEDICAL_RECORDS;
    const url = `${API_URL}${endpoint}/${universalRecordId}`;
    apiFetch(url, {
      method: 'DELETE',
    })
      .then(() => {
        setPopupMedicalRecord(undefined);
        setPopupPregnancyRecord(undefined);
        setSubmitSuccess(true);
        setIsDialogOpen(false);
        setRefetch(!refetch);
      })
      .catch(() => {
        setPopupMedicalRecord(undefined);
        setPopupPregnancyRecord(undefined);
        setIsDialogOpen(false);
        setSubmitError(true);
      });
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
      setPopupRecord: setPopupPregnancyRecord,
    },
    {
      name: 'Medical History',
      COLUMNS: MEDICAL_RECORD_COLUMNS,
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
      setPopupRecord: setPopupMedicalRecord,
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
      setPopupRecord: setPopupMedicalRecord,
    },
    {
      name: 'Timeline',
      Component: HistoryTimeline,
      index: 3,
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
        {p.name === 'Timeline' && p.Component ? (
          <p.Component patientId={patientId} isTransformed={isTransformed} />
        ) : (
          <>
            <div className={classes.topWrapper}>
              <TextField
                className={classes.search}
                label="Search"
                placeholder={p.searchText}
                variant="outlined"
                name={p.search}
                onChange={(e) => p.debounceSetSearch!(e.target.value)}
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
                      isTransformed
                        ? classes.selectField
                        : classes.selectFieldSmall
                    }
                  />
                  {!isTransformed && <br />}
                </>
              )}
            </div>
            <div className={classes.table}>
              <APITable
                endpoint={p.endpoint!}
                search={p.search!}
                columns={p.COLUMNS}
                sortableColumns={p.SORTABLE_COLUMNS}
                rowKey={p.rowKey!}
                initialSortBy={p.initialSortBy!}
                initialSortDir={p.initialSortDir!}
                RowComponent={p.RowComponent!}
                isTransformed={isTransformed}
                isDrugRecord={p.isDrugRecord}
                gestationalAgeUnit={unit}
                patientId={patientId}
                setDeletePopupOpen={setIsDialogOpen}
                setPopupRecord={p.setPopupRecord}
                refetch={refetch}
              />
            </div>
          </>
        )}
      </Tab.Pane>
    ),
  }));

  return (
    <div>
      <Toast
        severity="success"
        message="Record successfully deleted!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <ConfirmDialog
        title="Delete Record?"
        content="Are you sure you want to delete this record?"
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        onConfirm={handleDeleteRecord}
      />
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback(`/patients/${patientId ?? ''}`)}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">Past Records of {patientName}</Typography>
      </div>
      <Box p={3}>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
            className: classes.tabs,
          }}
          panes={panes}
          //Set search state value of the new active tab to empty to refresh the table
          onTabChange={(_, tabProps) => {
            const index = Number(tabProps.activeIndex!);
            if (
              (patientSex === SexEnum.FEMALE && index !== 3) ||
              (patientSex === SexEnum.MALE && index !== 2)
            ) {
              filteredPanes[index].debounceSetSearch!('');
            }
          }}
        />
      </Box>
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

import { Box, Typography } from '@mui/material';
import {
  EndpointEnum,
  GestationalAgeUnitEnum,
  SexEnum,
} from 'src/shared/enums';
import { Form, InputOnChangeData, Select, Tab } from 'semantic-ui-react';
import {
  MEDICAL_RECORD_COLUMNS,
  PREGNANCY_RECORD_COLUMNS,
  SORTABLE_MEDICAL_RECORD_COLUMNS,
  SORTABLE_PREGNANCY_RECORD_COLUMNS,
} from './constants';
import { MedicalRecord, Pregnancy } from 'src/shared/types';
import React, { useState } from 'react';
import { deleteMedicalRecordAsync, deletePregnancyAsync } from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { APITable } from 'src/shared/components/apiTable';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import { HistoryTimeline } from './HistoryTimeline';
import IconButton from '@mui/material/IconButton';
import { MedicalRecordRow } from './MedicalRecordRow';
import { PregnancyRecordRow } from './PregnancyRecordRow';
import { SortDir } from 'src/shared/components/apiTable/types';
import TextField from '@mui/material/TextField';
import { Toast } from 'src/shared/components/toast';
import Tooltip from '@mui/material/Tooltip';
import { debounce } from 'lodash';
import { gestationalAgeUnitLabels } from 'src/shared/constants';
import { goBackWithFallback } from 'src/shared/utils';
import makeStyles from '@mui/styles/makeStyles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouteMatch } from 'react-router-dom';

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
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord>();
  const [pregnancy, setPregnancy] = useState<Pregnancy>();
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
    if (!(medicalRecord || pregnancy)) return;

    try {
      if (medicalRecord) {
        await deleteMedicalRecordAsync(medicalRecord);
      } else if (pregnancy) {
        await deletePregnancyAsync(pregnancy);
      }

      setSubmitSuccess(true);
      setRefetch(!refetch);
    } catch (e) {
      setSubmitError(true);
    }

    setMedicalRecord(undefined);
    setPregnancy(undefined);
    setIsDialogOpen(false);
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
      setPopupRecord: setPregnancy,
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
      setPopupRecord: setMedicalRecord,
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
      setPopupRecord: setMedicalRecord,
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
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDeleteRecord}
      />
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback(`/patients/${patientId ?? ''}`)}
            size="large">
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

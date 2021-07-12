import { Paper, Typography, Divider, Box } from '@material-ui/core';
import { Form, Select, InputOnChangeData } from 'semantic-ui-react';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import PregnantWomanIcon from '@material-ui/icons/PregnantWoman';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { APITable } from 'src/shared/components/apiTable';
import { EndpointEnum, GestationalAgeUnitEnum } from 'src/shared/enums';
import { PatientPregnancyInfo } from 'src/shared/types';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { COLUMNS, SORTABLE_COLUMNS } from './constants';
import { PregnancyRow } from './PregnancyRow';
import { RedirectButton } from 'src/shared/components/redirectButton';
import {
  gestationalAgeUnitLabels,
  gestationalAgeUnitFormatters,
} from 'src/shared/constants';
import { getNumOfWeeksNumeric } from 'src/shared/utils';
import { SortDir } from 'src/shared/components/apiTable/types';
interface IProps {
  patientId: string;
}

export const PregnancyInfo = ({ patientId }: IProps) => {
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const [unit, setUnit] = useState(GestationalAgeUnitEnum.WEEKS);
  const [currentPregnancy, setCurrentPregnancy] =
    useState<PatientPregnancyInfo>();

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

  const PregnancyStatus = () => {
    const status = currentPregnancy!.isPregnant ? 'Yes' : 'No';

    let hasTimedOut = false;
    if (currentPregnancy!.isPregnant) {
      hasTimedOut =
        getNumOfWeeksNumeric(currentPregnancy!.pregnancyStartDate) > 40;
    }

    const GestationalAge = () => {
      return (
        <div>
          <p>
            <b>Gestational Age: </b>
            <span style={hasTimedOut ? { color: 'red' } : {}}>
              {gestationalAgeUnitFormatters[unit](
                currentPregnancy!.pregnancyStartDate,
                null
              )}
            </span>
          </p>
          <br />
        </div>
      );
    };

    return (
      <div>
        {currentPregnancy!.isPregnant ? (
          <RedirectButton
            text="Edit/Close"
            redirectUrl={`/patients/${patientId}/edit/pregnancyInfo/${
              currentPregnancy!.pregnancyId
            }`}
          />
        ) : (
          <RedirectButton
            text="Add"
            redirectUrl={`/pregnancies/new/${patientId}`}
          />
        )}
        <p>
          <b>Pregnant: </b> {status}
        </p>
        {currentPregnancy?.isPregnant && <GestationalAge />}
        {hasTimedOut && (
          <Alert severity="warning">Is the patient still pregnant?</Alert>
        )}
        {!currentPregnancy?.isPregnant && <br />}
      </div>
    );
  };

  return (
    <Paper className={classes.wrapper}>
      <Box p={3}>
        <Typography component="h3" variant="h5">
          <PregnantWomanIcon fontSize="large" /> &nbsp; Pregnancy Information
        </Typography>
        <Divider />
        <Form.Field
          name="gestationalAgeUnits"
          control={Select}
          options={unitOptions}
          placeholder={gestationalAgeUnitLabels[unit]}
          onChange={handleUnitChange}
          className={classes.margin}
        />
        <div className={classes.margin}>
          <h4>Current Pregnancy</h4>
          {currentPregnancy && <PregnancyStatus />}
        </div>
        <div>
          <Divider />
          <h4> Previous Obstetric History</h4>
          <div>
            <RedirectButton
              text="Add"
              redirectUrl={`/pregnancies/new/${patientId}`}
            />
            <TextField
              className={classes.search}
              label="Search"
              placeholder="Outcome"
              variant="outlined"
              onChange={(e) => debounceSetSearch(e.target.value)}
            />
          </div>
          <div className={classes.table}>
            <APITable
              endpoint={
                EndpointEnum.PATIENTS +
                `/${patientId}` +
                EndpointEnum.PREGNANCY_SUMMARY
              }
              search={search}
              columns={COLUMNS}
              sortableColumns={SORTABLE_COLUMNS}
              rowKey={'pregnancyId'}
              initialSortBy={'endDate'}
              initialSortDir={SortDir.DESC}
              RowComponent={PregnancyRow}
              isTransformed={isTransformed}
              gestationalAgeUnit={unit}
              patientId={patientId}
              setCurrentPregnancy={setCurrentPregnancy}
            />
          </div>
        </div>
      </Box>
    </Paper>
  );
};

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
    display: 'block',
    width: 225,
  },
  margin: {
    marginTop: 15,
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

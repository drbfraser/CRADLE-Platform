import { Paper, Typography, Divider, Box } from '@material-ui/core';
import { Form, Select, InputOnChangeData } from 'semantic-ui-react';
import { makeStyles } from '@material-ui/core/styles';
import PregnantWomanIcon from '@material-ui/icons/PregnantWoman';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { APITable } from 'src/shared/components/apiTable';
import { EndpointEnum, GestationalAgeUnitEnum } from 'src/shared/enums';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { COLUMNS, SORTABLE_COLUMNS } from './constants';
import { PregnancyRow } from './PregnancyRow';
import { gestationalAgeUnitLabels } from 'src/shared/constants';
interface IProps {
  patientId: string;
}

export const PregnancyInfo = ({ patientId }: IProps) => {
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const [unit, setUnit] = useState(GestationalAgeUnitEnum.WEEKS);

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

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);
  const isTransformed = useMediaQuery(`(min-width:560px)`);
  return (
    <Paper className={classes.wrapper}>
      <Box p={3}>
        <Typography component="h3" variant="h5">
          <PregnantWomanIcon fontSize="large" /> &nbsp; Pregnancy Information
        </Typography>
        <Divider />
        <div className={classes.topWrapper}>
          <TextField
            className={classes.search}
            label="Search"
            placeholder="Outcome"
            variant="outlined"
            onChange={(e) => debounceSetSearch(e.target.value)}
          />
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
        </div>
        <APITable
          endpoint={
            EndpointEnum.PATIENTS +
            `/${patientId}` +
            EndpointEnum.PREGNANCY_RECORDS
          }
          search={search}
          columns={COLUMNS}
          sortableColumns={SORTABLE_COLUMNS}
          rowKey={'pregnancyId'}
          initialSortBy={'endDate'}
          RowComponent={PregnancyRow}
          isTransformed={isTransformed}
          gestationalAgeUnit={unit}
          patientId={patientId}
        />
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

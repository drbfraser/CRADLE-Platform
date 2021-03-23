import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { EndpointEnum } from 'src/server';
import { APITable } from 'src/shared/components/apiTable';
import { ReferralRow } from './ReferralRow';

const columns = {
  patientName: 'Patient Name',
  patientId: 'Patient ID',
  villageNumber: 'Village',
  trafficLightStatus: 'Vital Sign',
  dateReferred: 'Date Referred',
  isAssessed: 'Assessment',
};

export const ReferralsPage = () => {
  const classes = useStyles();
  const [search, setSearch] = useState('');

  // ensure that we wait until the user has stopped typing
  const debounceSetSearch = debounce(setSearch, 500);

  return (
    <Paper className={classes.wrapper}>
      <div className={classes.topWrapper}>
        <h2 className={classes.title}>Referrals</h2>
        <TextField
          className={classes.search}
          label="Search"
          placeholder="Patient ID or Name"
          variant="outlined"
          onChange={(e) => debounceSetSearch(e.target.value)}
        />
      </div>
      <APITable
        endpoint={EndpointEnum.REFERRALS}
        search={search}
        columns={columns}
        rowKey={'referralId'}
        RowComponent={ReferralRow}
      />
    </Paper>
  );
};

const useStyles = makeStyles({
  wrapper: {
    backgroundColor: '#fff',
  },
  topWrapper: {
    padding: 15,
  },
  title: {
    display: 'inline-block',
  },
  search: {
    float: 'right',
  },
});

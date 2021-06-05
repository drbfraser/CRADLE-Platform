import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { APITable } from 'src/shared/components/apiTable';
import { EndpointEnum } from 'src/shared/enums';
import { ReferralRow } from './ReferralRow';
import useMediaQuery from '@material-ui/core/useMediaQuery';

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

  const isBigScreen = useMediaQuery('(min-width:440px)');
  const isTransformed = useMediaQuery('(min-width:560px)')

  return (
    <Paper className={classes.wrapper}>
      <div className={classes.topWrapper}>
        <h2 className={classes.title}>Referrals</h2>
        <TextField
          className={isBigScreen ? classes.search : classes.searchThin}
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
        isTransformed={isTransformed}
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
  searchThin: {
    display: 'block',
    marginLeft: 1,
  },
});

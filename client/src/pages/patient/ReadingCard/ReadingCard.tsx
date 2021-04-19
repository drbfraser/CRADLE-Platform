import React from 'react';
import { Grid, Paper, Box, makeStyles } from '@material-ui/core';
import { Reading } from 'src/shared/types';
import { ReadingData } from './ReadingData';
import { ReferralData } from './ReferralData';

interface IProps {
  reading: Reading;
}

export const ReadingCard = ({ reading }: IProps) => {
  const styles = useStyles();

  return (
    <Paper>
      <Box p={3}>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <ReadingData reading={reading} />
          </Grid>
          <Grid item xs={6} className={styles.blueBorderLeft}>
            <ReferralData reading={reading} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

const useStyles = makeStyles({
  blueBorderLeft: {
    borderLeft: '2px solid #84ced4',
  },
});

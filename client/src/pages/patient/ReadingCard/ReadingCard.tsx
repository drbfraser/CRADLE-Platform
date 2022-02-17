import React from 'react';
import { Grid, Paper, Box } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core';
import { Reading } from 'src/shared/types';
import { ReadingData } from './ReadingData';
// import { ReferralData } from './ReferralData';
// import { useTheme } from '@material-ui/core/styles';
// import useMediaQuery from '@material-ui/core/useMediaQuery';

interface IProps {
  reading: Reading;
}

export const ReadingCard = ({ reading }: IProps) => {
  // const styles = useStyles();
  // const theme = useTheme();
  // const isBigScreen = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Paper>
      <Box p={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <ReadingData reading={reading} />
          </Grid>
          {/* <Grid
            item
            xs={12}
            sm={6}
            className={isBigScreen ? styles.borderLeft : styles.borderTop}>
            <ReferralData reading={reading} />
          </Grid> */}
        </Grid>
      </Box>
    </Paper>
  );
};

// const useStyles = makeStyles({
//   borderLeft: {
//     borderLeft: '2px solid #84ced4',
//   },
//   borderTop: {
//     borderTop: '2px solid #84ced4',
//   },
// });

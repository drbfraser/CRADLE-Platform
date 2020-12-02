import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import React from 'react';

export const VitalSigns = () => {
  return (
    <Grid container spacing={2}>
      <Grid item md>
        <Paper>
          <Box p={2}>
            <h2>Vital Signs</h2>
          </Box>
        </Paper>
      </Grid>
      <Grid item md>
        <Paper>
          <Box p={2}>
            <h2>Urine Test</h2>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  )
};

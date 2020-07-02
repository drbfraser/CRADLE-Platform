import React from 'react';
import { connect } from 'react-redux';
import { FormControl, Input, InputLabel, Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(2),
      },
    },
    formField: {
      margin: theme.spacing(2),
      minWidth: '22ch',
    },
    formControl: {
      margin: theme.spacing(3),
    },
    formFieldWide: {
      margin: theme.spacing(2),
      minWidth: '56ch',
    },
    formFieldSWide: {
      margin: theme.spacing(2),
      minWidth: '36ch',
    },
  })
);

const Page: React.FC<any> = () => {
  const classes = useStyles();
  return (
    <Paper
      style={{
        padding: '35px 25px',
        marginTop: '2%',
        borderRadius: '15px',
      }}>
      <h1>
        <b>Assessment</b>
      </h1>

      <form className={classes.root} noValidate autoComplete="off">
        <FormControl className={classes.formFieldWide}>
          <InputLabel required htmlFor="component-simple">
            Special Inestigation + Results (if avaulable)
          </InputLabel>
          <Input id="component-outlined" />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <InputLabel required htmlFor="component-outlined">
            Final Diagnosis
          </InputLabel>
          <Input id="component-outlined" />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <InputLabel required htmlFor="component-outlined">
            Treatment/Operation
          </InputLabel>
          <Input id="component-outlined" />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <InputLabel required htmlFor="component-outlined">
            Medication Prescribed
          </InputLabel>
          <Input id="component-outlined" />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <InputLabel htmlFor="component-outlined">Frequesncy</InputLabel>
          <Input id="component-outlined" />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <InputLabel htmlFor="component-outlined">Frequency Unit</InputLabel>
          <Input id="component-outlined" />
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <InputLabel htmlFor="component-outlined">Until</InputLabel>
          <Input id="component-outlined" />
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <InputLabel htmlFor="component-outlined">Until Date</InputLabel>
          <Input id="component-outlined" />
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <InputLabel htmlFor="component-outlined">Other</InputLabel>
          <Input id="component-outlined" />
        </FormControl>
      </form>
    </Paper>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export const Assessment = connect(mapStateToProps, mapDispatchToProps)(Page);

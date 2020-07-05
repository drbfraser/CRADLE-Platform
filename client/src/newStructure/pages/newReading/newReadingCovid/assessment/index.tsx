import React from 'react';
import { connect } from 'react-redux';
import { FormControl, Paper, TextField } from '@material-ui/core';
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
function replaceAll(string: string, search: string, replace: string) {
  return string.split(search).join(replace);
}
const Page: React.FC<any> = () => {
  const classes = useStyles();
  const stringDate = new Date().toLocaleDateString();
  const defaultDate = replaceAll(stringDate, '/', '-');
  console.log(defaultDate);
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
          <TextField
            id="outlined-multiline-static"
            label="Special Inestigation + Results (if avaulable)"
            multiline
            rows={2}
            defaultValue="..."
            variant="outlined"
          />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <TextField
            id="outlined-multiline-static"
            label="Final Diagnosis"
            multiline
            rows={2}
            defaultValue="..."
            variant="outlined"
          />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <TextField
            id="outlined-multiline-static"
            label="Treatment/Operation"
            multiline
            rows={2}
            defaultValue="..."
            variant="outlined"
          />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <TextField
            id="outlined-multiline-static"
            label="Medication Prescribed"
            multiline
            rows={2}
            defaultValue="..."
            variant="outlined"
          />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <TextField
            id="outlined-multiline-static"
            label="Frequesncy"
            defaultValue="..."
            variant="outlined"
          />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <TextField
            id="outlined-multiline-static"
            label="Frequency Unit"
            select
            defaultValue="..."
            variant="outlined"
          />
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <TextField
            id="outlined-multiline-static"
            label="Until"
            select
            defaultValue="..."
            variant="outlined"
          />
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <TextField
            id="outlined-multiline-static"
            label="Until Date"
            defaultValue="2020-06-06"
            type="date"
            variant="outlined"
          />
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <TextField
            id="outlined-multiline-static"
            label="Other"
            defaultValue="..."
            variant="outlined"
          />
        </FormControl>
      </form>
    </Paper>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export const Assessment = connect(mapStateToProps, mapDispatchToProps)(Page);

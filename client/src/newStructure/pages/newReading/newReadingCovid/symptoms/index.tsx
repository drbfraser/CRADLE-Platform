import React from 'react';
import { connect } from 'react-redux';
import {
  FormControl,
  FormControlLabel,
  Checkbox,
  Paper,
  FormGroup,
  FormLabel,
  TextField,
} from '@material-ui/core';

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
    formFieldDM: {
      margin: theme.spacing(2),
      minWidth: '48ch',
      minHeight: '15ch',
    },
    formControl: {
      margin: theme.spacing(3),
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
        <b>Collect Symptoms</b>
      </h1>

      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Regular</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={true} name="gilad" />}
            label="None (Patient healthy)"
          />
          <FormControlLabel
            control={<Checkbox checked={false} name="jason" />}
            label="Headache"
          />
          <FormControlLabel
            control={<Checkbox checked={true} name="antoine" />}
            label="Blurred Vission"
          />
          <FormControlLabel
            control={<Checkbox checked={true} name="antoine" />}
            label="Abdominal Pain"
          />
        </FormGroup>
        <FormControlLabel
          control={<Checkbox checked={true} name="gilad" />}
          label="Bleeding"
        />
        <FormControlLabel
          control={<Checkbox checked={false} name="jason" />}
          label="Feverish"
        />
        <FormControlLabel
          control={<Checkbox checked={true} name="antoine" />}
          label="Unwell"
        />
      </FormControl>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Covid</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={false} name="gilad" />}
            label="Cough"
          />
          <FormControlLabel
            control={<Checkbox checked={false} name="jason" />}
            label="Shortness of Breath"
          />
          <FormControlLabel
            control={<Checkbox checked={true} name="antoine" />}
            label="Sore Throat"
          />
          <FormControlLabel
            control={<Checkbox checked={true} name="antoine" />}
            label="Muscle ache"
          />
        </FormGroup>
        <FormControlLabel
          control={<Checkbox checked={true} name="gilad" />}
          label="Fatigue"
        />
        <FormControlLabel
          control={<Checkbox checked={false} name="jason" />}
          label="Loss of sense"
        />
        <FormControlLabel
          control={<Checkbox checked={false} name="jason" />}
          label="Loss of taste"
        />
        <FormControlLabel
          control={<Checkbox checked={false} name="jason" />}
          label="Loss of smell"
        />
      </FormControl>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormControl className={classes.formFieldDM}>
          <TextField
            id="outlined-multiline-static"
            label="Multiline"
            multiline
            rows={4}
            defaultValue="Others"
            variant="outlined"
          />
        </FormControl>
      </FormControl>
    </Paper>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});
export const Symptoms = connect(mapStateToProps, mapDispatchToProps)(Page);

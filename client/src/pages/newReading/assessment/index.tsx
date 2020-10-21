import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Paper,
  TextField,
} from '@material-ui/core';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

import React from 'react';

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
      width: '46.5%',
    },
    formFieldSWide: {
      margin: theme.spacing(2),
      minWidth: '26ch',
      width: '22%',
    },
    formFieldLWide: {
      margin: theme.spacing(2),
      minWidth: '56ch',
      width: '71%',
    },
  })
);
// function replaceAll(string: string, search: string, replace: string) {
//   return string.split(search).join(replace);
// }
interface IProps {
  assessment: any;
  onChange: any;
}
const Page: React.FC<IProps> = (props) => {
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
          <TextField
            id="outlined-multiline-static"
            label="Investigation Results (if available)"
            multiline
            rows={2}
            variant="outlined"
            name={'specialInvestigations'}
            value={props.assessment.specialInvestigations}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <TextField
            id="outlined-multiline-static"
            label="Final Diagnosis"
            multiline
            rows={2}
            variant="outlined"
            name={'finalDiagnosis'}
            value={props.assessment.finalDiagnosis}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <TextField
            id="outlined-multiline-static"
            label="Treatment/Operation"
            multiline
            rows={2}
            variant="outlined"
            name={'treatmentOP'}
            value={props.assessment.treatmentOP}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <TextField
            id="outlined-multiline-static"
            label="Medication Prescribed (include dose and frequency)"
            multiline
            rows={2}
            variant="outlined"
            name={'medPrescribed'}
            value={props.assessment.medPrescribed}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControlLabel
          className={classes.formFieldSWide}
          control={
            <Checkbox
              name={'enabled'}
              checked={props.assessment.enabled}
              onChange={props.onChange}
            />
          }
          label="Follow-up Needed"
        />
        <FormControl className={classes.formFieldLWide}>
          <TextField
            disabled={!props.assessment.enabled}
            id="outlined-multiline-static"
            label="Instructions for Follow up"
            variant="outlined"
            name={'InstructionFollow'}
            value={props.assessment.InstructionFollow}
            onChange={props.onChange}
          />
        </FormControl>
      </form>
    </Paper>
  );
};

export const Assessment = Page;

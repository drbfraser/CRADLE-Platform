import React from 'react';
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
// function replaceAll(string: string, search: string, replace: string) {
//   return string.split(search).join(replace);
// }
interface IProps {
  assessment: any;
  onChange: any;
}
const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();
  // const stringDate = new Date().toLocaleDateString();
  // const defaultDate = replaceAll(stringDate, '/', '-');
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
            label="Special Investigation + Results (if avaulable)"
            multiline
            rows={2}
            defaultValue="..."
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
            defaultValue="..."
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
            defaultValue="..."
            variant="outlined"
            name={'treatmentOP'}
            value={props.assessment.treatmentOP}
            onChange={props.onChange}
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
            name={'medPrescribed'}
            value={props.assessment.medPrescribed}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <TextField
            id="outlined-multiline-static"
            label="Frequesncy"
            defaultValue="..."
            variant="outlined"
            name={'frequency'}
            value={props.assessment.frequency}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formFieldWide}>
          <TextField
            id="outlined-multiline-static"
            label="Frequency Unit"
            select
            defaultValue="..."
            variant="outlined"
            name={'frequencyUnit'}
            value={props.assessment.frequencyUnit}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <TextField
            id="outlined-multiline-static"
            label="Until"
            select
            defaultValue="..."
            variant="outlined"
            name={'until'}
            value={props.assessment.until}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <TextField
            label="Until Date"
            type="date"
            defaultValue="2017-05-24"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            name={'untilDate'}
            value={props.assessment.untilDate}
            onChange={props.onChange}
          />
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <TextField
            id="outlined-multiline-static"
            label="Other"
            defaultValue="..."
            variant="outlined"
            name={'other'}
            value={props.assessment.other}
            onChange={props.onChange}
          />
        </FormControl>
      </form>
    </Paper>
  );
};

export const Assessment = Page;

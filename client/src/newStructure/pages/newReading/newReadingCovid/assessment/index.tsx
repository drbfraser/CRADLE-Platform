import React from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
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
      minWidth: '36ch',
      width: '30%',
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
  const followupFrequencyUnitUnit = [
    { label: 'N/a', value: 'NONE' },
    { label: 'Minutes', value: 'MINUTES' },
    { label: 'Hours', value: 'HOURS' },
    { label: 'Days', value: 'DAYS' },
    { label: 'Weeks', value: 'WEEKS' },
    { label: 'Months', value: 'MONTHS' },
    { label: 'Years', value: 'YEARS' },
  ];
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
        <FormControlLabel
          style={{ display: 'flex', float: 'right' }}
          control={
            <Checkbox
              name={'enabled'}
              checked={props.assessment.enabled}
              onChange={props.onChange}
            />
          }
          label="Follow-up Needed"
        />
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
            disabled={!props.assessment.enabled}
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
            disabled={!props.assessment.enabled}
            variant="outlined"
            id="outlined-multiline-static"
            label="Frequency Unit"
            select
            name={'frequencyUnit'}
            value={props.assessment.frequencyUnit}
            onChange={props.onChange}>
            {followupFrequencyUnitUnit.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <TextField
            disabled={!props.assessment.enabled}
            id="outlined-multiline-static"
            label="Until"
            select
            defaultValue="..."
            variant="outlined"
            name={'until'}
            value={props.assessment.until}
            onChange={props.onChange}>
            <MenuItem key={'date'} value={'date'}>
              {'Date'}
            </MenuItem>
            <MenuItem key={'other'} value={'other'}>
              {'Other'}
            </MenuItem>
          </TextField>
        </FormControl>
        <FormControl className={classes.formFieldSWide}>
          <TextField
            disabled={
              !props.assessment.enabled || props.assessment.until !== 'date'
            }
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
            disabled={
              !props.assessment.enabled || props.assessment.until !== 'other'
            }
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

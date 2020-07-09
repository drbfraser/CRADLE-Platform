import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  FormControl,
  Paper,
  Checkbox,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';

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
      width: '90%',
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

interface IProps {
  urineTest: any;
  onChange: any;
}
const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();

  return (
    <Paper
      style={{
        padding: '35px 25px',
        borderRadius: '15px',
      }}>
      <h1>
        <b>Urine Test</b>
        <Checkbox
          name={'enabled'}
          checked={props.urineTest.enabled}
          onChange={props.onChange}
          inputProps={{ 'aria-label': 'primary checkbox' }}
        />
      </h1>

      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formField}>
          <FormControl className={classes.formField}>
            <InputLabel id="demo-simple-select-label">Leukocytes</InputLabel>
            <Select
              disabled={!props.urineTest.enabled}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={props.urineTest.leukocytes}
              name={'leukocytes'}
              onChange={props.onChange}
              required>
              <MenuItem value={'m'}>-</MenuItem>
              <MenuItem value={'p'}>+</MenuItem>
              <MenuItem value={'pp'}>++</MenuItem>
              <MenuItem value={'ppp'}>+++</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formField}>
            <InputLabel id="demo-simple-select-label">Nitrites</InputLabel>
            <Select
              disabled={!props.urineTest.enabled}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={props.urineTest.nitrites}
              name={'nitrites'}
              onChange={props.onChange}
              required>
              <MenuItem value={'m'}>-</MenuItem>
              <MenuItem value={'p'}>+</MenuItem>
              <MenuItem value={'pp'}>++</MenuItem>
              <MenuItem value={'ppp'}>+++</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formField}>
            <InputLabel id="demo-simple-select-label">Glucose</InputLabel>
            <Select
              disabled={!props.urineTest.enabled}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={props.urineTest.glucose}
              name={'glucose'}
              onChange={props.onChange}
              required>
              <MenuItem value={'m'}>-</MenuItem>
              <MenuItem value={'p'}>+</MenuItem>
              <MenuItem value={'pp'}>++</MenuItem>
              <MenuItem value={'ppp'}>+++</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formField}>
            <InputLabel id="demo-simple-select-label">Protein</InputLabel>
            <Select
              disabled={!props.urineTest.enabled}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={props.urineTest.protein}
              name={'protein'}
              onChange={props.onChange}
              required>
              <MenuItem value={'m'}>-</MenuItem>
              <MenuItem value={'p'}>+</MenuItem>
              <MenuItem value={'pp'}>++</MenuItem>
              <MenuItem value={'ppp'}>+++</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formField}>
            <InputLabel id="demo-simple-select-label">Blood</InputLabel>
            <Select
              disabled={!props.urineTest.enabled}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={props.urineTest.blood}
              name={'blood'}
              onChange={props.onChange}
              required>
              <MenuItem value={'m'}>-</MenuItem>
              <MenuItem value={'p'}>+</MenuItem>
              <MenuItem value={'pp'}>++</MenuItem>
              <MenuItem value={'ppp'}>+++</MenuItem>
            </Select>
          </FormControl>
        </FormControl>
      </form>
    </Paper>
  );
};

export const UrineTest = Page;

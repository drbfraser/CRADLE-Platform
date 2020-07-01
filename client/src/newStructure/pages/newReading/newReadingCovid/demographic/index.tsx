import React from 'react';
import { connect } from 'react-redux';

import {
  FormControl,
  Input,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

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

  return(
    <Paper
          style={{
            padding: '35px 25px',
            marginTop: '2%',
            borderRadius: '15px',
          }}>
          <h1>
            <b>Collect Basic Demographic</b>
          </h1>

          <form className={classes.root} noValidate autoComplete="off">
            <FormControl className={classes.formField}>
              <InputLabel required htmlFor="component-simple">
                Patient Initials
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formField}>
              <InputLabel required htmlFor="component-outlined">
                ID
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formField}>
              <InputLabel htmlFor="component-outlined">Age</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formField}>
              <InputLabel htmlFor="component-outlined">Birthday</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formField}>
              <InputLabel required htmlFor="component-outlined">
                Gender
              </InputLabel>
              <Select
                native
                labelId="demo-simple-select-label"
                id="demo-simple-select">
                <option value={'10'}>Male</option>
                <option value={'20'}>Female</option>
                <option value={'30'}>Other</option>
              </Select>
            </FormControl>
            <FormControl className={classes.formField}>
              <FormControlLabel
                control={<Checkbox checked={true} name="Pregnant" />}
                label="Pregnant"
              />
            </FormControl>
            <FormControl className={classes.formField}>
              <InputLabel htmlFor="component-outlined">
                House Hold Number
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formField}>
              <InputLabel required htmlFor="component-outlined">
                Gestational Age
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formField}>
              <InputLabel required htmlFor="component-outlined">
                Gestational Age Unit
              </InputLabel>
              <Select
                native
                labelId="demo-simple-select-label"
                id="demo-simple-select">
                <option value={'10'}>Weeks</option>
                <option value={'20'}>Months</option>
              </Select>
            </FormControl>
            <FormControl className={classes.formField}>
              <InputLabel htmlFor="component-outlined">Zone</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formField}>
              <InputLabel htmlFor="component-outlined">Village</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldDM}>
              <InputLabel htmlFor="component-outlined">Drug History</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldDM}>
              <InputLabel htmlFor="component-outlined">
                Medical History
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
          </form>
       
        </Paper>
  )
}


const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});
export const Demographics = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
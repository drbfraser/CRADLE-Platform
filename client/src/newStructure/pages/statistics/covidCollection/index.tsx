import React from 'react';
import { connect } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ReduxState } from '../../../redux/rootReducer';
import {
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Input,
  Select,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
        width: '75ch',
      },
    },
  })
);

const Page: React.FC<any> = (props) => {
  const classes = useStyles();
  const [houseHoldNum, setHouseHoldNum] = React.useState('');
  const [totalPeople, setTotalPeople] = React.useState('10');

  const handleChangeHouseHold = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setHouseHoldNum(event.target.value as string);
  };

  const handleChangeTotalNumber = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setTotalPeople(event.target.value as string);
  };
  return (
    <div
      style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
      <h1>
        <b>Covid 19 Data Collection</b>
      </h1>
      <Divider></Divider>
      <Paper
        style={{
          padding: '35px 25px',
          borderRadius: '15px',
          marginTop: '25px',
        }}>
        <form className={classes.root} noValidate autoComplete="off">
          <FormControl>
            <InputLabel htmlFor="component-simple">
              House Hold Number
            </InputLabel>
            <Select
              native
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={houseHoldNum}
              onChange={handleChangeHouseHold}>
              <option value={'10'}>1234</option>
              <option value={'20'}>4321</option>
              <option value={'30'}>2341</option>
            </Select>
          </FormControl>
          <FormControl disabled>
            <InputLabel htmlFor="component-disabled">
              Number of People in Household
            </InputLabel>
            <Input
              id="component-disabled"
              value={totalPeople}
              onChange={handleChangeTotalNumber}
            />
          </FormControl>
        </form>
      </Paper>
    </div>
  );
};

const mapStateToProps = ({ patients }: ReduxState) => ({});

const mapDispatchToProps = (dispatch: any) => ({});
export const CovidCollection = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);

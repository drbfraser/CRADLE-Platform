import React from 'react';
import { connect } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ReduxState } from '../../../redux/rootReducer';
import MaterialTable from 'material-table';
import {
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Input,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControlLabel,
  Checkbox,
  FormLabel,
  RadioGroup,
  Radio,
  MenuItem,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
        width: '75ch',
      },
    },
    dialogContent: {
      margin: theme.spacing(1),
      marginTop: '10px',
    },
    dialogField: {
      margin: theme.spacing(2),
      minWidth:'22ch'
    },
  })
);

const Page: React.FC<any> = (props) => {
  const classes = useStyles();
  const [valueR, setValueR] = React.useState('female');
  const [houseHoldNum, setHouseHoldNum] = React.useState('');
  const [totalPeople, setTotalPeople] = React.useState('10');
  const [openD, setOpenD] = React.useState(false);
  const handleCloseDropDown = () => {
    setOpenD(false);
  };

  const handleOpenDropDown = () => {
    setOpenD(true);
  };
  const [columns] = React.useState<any>([
    { title: 'Id', field: 'id' },
    { title: 'Name', field: 'name' },
    { title: 'Dob', field: 'birthYear', type: 'numeric' },
    { title: 'age', field: 'birthYear', type: 'numeric' },
    {
      title: 'Status',
      field: 'imageUrlStatus',
      render: (rowData: any) => (
        <img
          src={rowData.imageUrlStatus}
          style={{ width: 40, borderRadius: '50%' }}
        />
      ),
    },
  ]);

  const handleChangeR = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueR((event.target as HTMLInputElement).value);
  };
  const status = [
    {
      label: 'Recovered',
      src:
        'https://cdn3.vectorstock.com/i/1000x1000/09/82/check-icon-vector-10850982.jpg',
      link: ' ',
      value: 'rec',
    },
    {
      label: 'Deceased',
      src:
        'https://media.istockphoto.com/vectors/red-x-mark-icon-cross-symbol-vector-id692279886?k=6&m=692279886&s=170667a&w=0&h=PkTBYGVXGx0evEEjCMePs5suU12XTqUSlqaQdll87o0=',
      link: ' ',
      value: 'dec',
    },
    {
      label: 'Suspected',
      src:
        'https://lh3.googleusercontent.com/proxy/iYC9_Nk1Qlh3y9zfTj6KpsD8Bi-zTTFvobKjjOH8XQglq1dNuTX12PkqsqIBHNGgkJgslpx5yjwR1lbl2p9cR7CMRcr5NKc',
      link: ' ',
      value: 'sus',
    },
    {
      label: 'Test Result Positive',
      src: 'https://storage.needpix.com/rsynced_images/blood-2667009_1280.png',
      link: ' ',
      value: 'pos',
    },
    {
      label: 'Test Result Negative',
      src: 'https://storage.needpix.com/rsynced_images/blood-2667006_1280.png',
      link: ' ',
      value: 'neg',
    },
  ];

  const [data] = React.useState<any>([
    {
      id: '111222',
      name: 'Kabab I am Suspected',
      birthYear: 1987,
      birthCity: 63,
      imageUrlStatus:
        'https://lh3.googleusercontent.com/proxy/iYC9_Nk1Qlh3y9zfTj6KpsD8Bi-zTTFvobKjjOH8XQglq1dNuTX12PkqsqIBHNGgkJgslpx5yjwR1lbl2p9cR7CMRcr5NKc',
    },
    {
      id: '45454',
      name: 'Kabab I am Recovered',
      birthYear: 2017,
      birthCity: 34,
      imageUrlStatus:
        'https://cdn3.vectorstock.com/i/1000x1000/09/82/check-icon-vector-10850982.jpg',
    },
    {
      id: '45454',
      name: 'Kabab I am Dead',
      birthYear: 2017,
      birthCity: 34,
      imageUrlStatus:
        'https://media.istockphoto.com/vectors/red-x-mark-icon-cross-symbol-vector-id692279886?k=6&m=692279886&s=170667a&w=0&h=PkTBYGVXGx0evEEjCMePs5suU12XTqUSlqaQdll87o0=',
    },
    {
      id: '45454',
      name: 'Kabab I am Tested Positive',
      birthYear: 2017,
      birthCity: 34,
      imageUrlStatus:
        'https://storage.needpix.com/rsynced_images/blood-2667009_1280.png',
    },
    {
      id: '45454',
      name: 'Kabab I am Tested Negative',
      birthYear: 2017,
      birthCity: 34,
      imageUrlStatus:
        'https://storage.needpix.com/rsynced_images/blood-2667006_1280.png',
    },
  ]);
  const handleChangeHouseHold = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setHouseHoldNum(event.target.value as string);
  };
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
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

        <MaterialTable
          title="People"
          columns={columns}
          data={data}
          options={{
            headerStyle: {
              marginLeft: 'auto',
              paddingRight: '0px !important',
              paddingLeft: '0px !important',
            },
            actionsColumnIndex: -1,
          }}
          actions={[
            {
              icon: 'edit',
              tooltip: 'Edit User',
              onClick: (event, rowData) => setOpen(true),
            },
            {
              icon: 'delete',
              tooltip: 'Delete User',
              onClick: (event, rowData) => {},
            },
          ]}
        />
      </Paper>
      <Dialog
        maxWidth="sm"
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Individual Information</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <FormControl className={classes.dialogField}>
            <InputLabel htmlFor="component-disabled">Initials</InputLabel>
            <Input
              id="component-disabled"
              value={totalPeople}
              onChange={handleChangeTotalNumber}
            />
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel htmlFor="component-disabled">Age</InputLabel>
            <Input
              id="component-disabled"
              value={totalPeople}
              onChange={handleChangeTotalNumber}
            />
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel htmlFor="component-disabled">DOB</InputLabel>
            <Input
              id="component-disabled"
              value={totalPeople}
              onChange={handleChangeTotalNumber}
            />
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel htmlFor="component-disabled">Zone Numebr</InputLabel>
            <Input
              id="component-disabled"
              value={totalPeople}
              onChange={handleChangeTotalNumber}
            />
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel htmlFor="component-disabled">Village Numebr</InputLabel>
            <Input
              id="component-disabled"
              value={totalPeople}
              onChange={handleChangeTotalNumber}
            />
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel htmlFor="component-disabled">@Station</InputLabel>
            <Input
              id="component-disabled"
              value={totalPeople}
              onChange={handleChangeTotalNumber}
            />
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel htmlFor="component-disabled">M/F</InputLabel>
            <Input
              id="component-disabled"
              value={totalPeople}
              onChange={handleChangeTotalNumber}
            />
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel htmlFor="component-simple">Status</InputLabel>
            <Select
              open={openD}
              onClose={handleCloseDropDown}
              onOpen={handleOpenDropDown}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={houseHoldNum}
              onChange={handleChangeHouseHold}>
              {status.map((option, key) => (
                <MenuItem value={option.src} key={key} style={{width:'22ch'}}>
                  <img src={option.src} style={{ width: `15%` }}/>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className={classes.dialogField}>
            <FormControlLabel
              control={<Checkbox checked={true} name="Pregnant" />}
              label="Pregnant"
            />
          </FormControl>
          <FormControl component="fieldset" className={classes.dialogField}>
            <FormLabel component="legend">Gender</FormLabel>
            <RadioGroup
              aria-label="gender"
              name="gender1"
              value={valueR}
              onChange={handleChangeR}>
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel
                value="other"
                control={<Radio />}
                label="Other"
              />
              <FormControlLabel
                value="disabled"
                disabled
                control={<Radio />}
                label="(Disabled option)"
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Transfer
          </Button>
          <Button onClick={handleClose} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const mapStateToProps = ({ patients }: ReduxState) => ({});

const mapDispatchToProps = (dispatch: any) => ({});
export const CovidCollection = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);

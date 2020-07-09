import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
} from '@material-ui/core';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

import MaterialTable from 'material-table';
import React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
        width: '75ch',
      },
    },
    dialogContent: {
      marginLeft: '10%',
      marginRight: '5%',
    },
    dialogField: {
      margin: theme.spacing(2),
      minWidth: '22ch',
    },
    dialogTitle: {
      textAlign: 'center',
    },
  })
);

const Page: React.FC<any> = () => {
  const classes = useStyles();
  const [valueR, setValueR] = React.useState('female');
  const [houseHoldNum, setHouseHoldNum] = React.useState('');
  const [totalPeople, setTotalPeople] = React.useState('5');
  const [openDT, setOpenDT] = React.useState(false);
  const handleCloseDropDownT = () => {
    setOpenDT(false);
  };

  const handleOpenDropDownT = () => {
    setOpenDT(true);
  };
  const [openD, setOpenD] = React.useState(false);
  const handleCloseDropDown = () => {
    setOpenD(false);
  };

  const handleOpenDropDown = () => {
    setOpenD(true);
  };
  const [columns] = React.useState<any>([
    { title: 'Initial', field: 'id' },
    { title: 'Name', field: 'name' },
    { title: 'Dob', field: 'birthYear', type: 'numeric' },
    { title: 'age', field: 'birthYear', type: 'numeric' },
    {
      title: 'Status',
      field: 'imageUrlStatus',
      render: (rowData: any) => (
        <img
          alt="Status"
          src={rowData.imageUrlStatus}
          style={{ width: 40, borderRadius: '50%' }}
        />
      ),
    },
  ]);

  const handleChangeR = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueR((event.target as HTMLInputElement).value);
  };
  const houseHoldNumbers = [
    {
      label: '1124',
    },
    {
      label: '2124',
    },
    {
      label: '33124',
    },
    {
      label: '112124',
    },
    {
      label: '112222',
    },
    {
      label: '114434',
    },
    {
      label: '11212',
    },
    {
      label: '122124',
    },
    {
      label: '112554',
    },
  ];
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
        'https://images.vexels.com/media/users/3/152864/isolated/preview/2e095de08301a57890aad6898ad8ba4c-yellow-circle-question-mark-icon-by-vexels.png',
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
      id: 'SS',
      name: 'I am Suspected',
      birthYear: 1987,
      birthCity: 63,
      imageUrlStatus:
        'https://images.vexels.com/media/users/3/152864/isolated/preview/2e095de08301a57890aad6898ad8ba4c-yellow-circle-question-mark-icon-by-vexels.png',
    },
    {
      id: 'RR',
      name: 'I am Recovered',
      birthYear: 2017,
      birthCity: 34,
      imageUrlStatus:
        'https://cdn3.vectorstock.com/i/1000x1000/09/82/check-icon-vector-10850982.jpg',
    },
    {
      id: 'DD',
      name: 'I am Passed A',
      birthYear: 2017,
      birthCity: 34,
      imageUrlStatus:
        'https://media.istockphoto.com/vectors/red-x-mark-icon-cross-symbol-vector-id692279886?k=6&m=692279886&s=170667a&w=0&h=PkTBYGVXGx0evEEjCMePs5suU12XTqUSlqaQdll87o0=',
    },
    {
      id: 'TP',
      name: 'I am Tested Positive',
      birthYear: 2017,
      birthCity: 34,
      imageUrlStatus:
        'https://storage.needpix.com/rsynced_images/blood-2667009_1280.png',
    },
    {
      id: 'TN',
      name: 'I am Tested Negative',
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
  const [openT, setOpenT] = React.useState(false);

  const [personInit, setPersonInit] = React.useState('45454');
  const handlePersonInit = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPersonInit(event.target.value as string);
  };

  const openTransfer = () => {
    setOpenT(true);
  };
  const handleCloseT = () => {
    setOpenT(false);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const openDialog = () => {
    setOpen(true);
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
              onClick: (event, rowData: any) => {
                console.log(event);
                setOpen(true);
                setPersonInit(rowData.id);
              },
            },
            {
              icon: 'delete',
              tooltip: 'Delete User',
              onClick: (event, rowData) => {
                console.log(event);
                setOpen(true);
                setPersonInit(rowData.id);
              },
            },
          ]}
        />
        <IconButton
          aria-label="add"
          style={{ marginLeft: '92%' }}
          onClick={openDialog}>
          <img
            alt="Add"
            style={{ width: '4ch', borderRadius: '50%', padding: '2px 2px' }}
            src="data:image/png;base64,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"
          />
        </IconButton>
      </Paper>
      <Dialog
        maxWidth="sm"
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          Individual Information
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <FormControl className={classes.dialogField}>
            <InputLabel htmlFor="component-disabled">Initials</InputLabel>
            <Input
              id="component-disabled"
              value={personInit}
              onChange={handlePersonInit}
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
                <MenuItem
                  value={option.src}
                  key={key}
                  style={{ width: '22ch' }}>
                  <img
                    alt={option.label}
                    src={option.src}
                    style={{ width: `15%` }}
                  />
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
          <Button onClick={openTransfer} color="primary">
            Transfer
          </Button>
          <Button onClick={handleClose} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        maxWidth="sm"
        open={openT}
        onClose={handleCloseT}
        aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          Transfer Individual x To
        </DialogTitle>
        <DialogContent>
          <FormControl className={classes.dialogField}>
            <InputLabel htmlFor="component-simple">
              House Hold Number
            </InputLabel>
            <Select
              open={openDT}
              onClose={handleCloseDropDownT}
              onOpen={handleOpenDropDownT}
              labelId="demo-simple-select-label"
              id="demo-simple-select">
              {houseHoldNumbers.map((option, key) => (
                <MenuItem key={key} style={{ width: '20ch' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseT} color="primary">
            Trasnfer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});
export const CovidCollection = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);

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
  Dialog ,
  DialogActions,
  DialogContent ,
  DialogContentText ,
  DialogTitle ,
  TextField,
  Button
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

  const handleClickOpen = () => {
    setOpen(true);
  };

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
            actionsColumnIndex: -1

          }}
          actions={[
            {
              icon: 'edit',
              tooltip: 'Save User',
              onClick: (event, rowData) => handleClickOpen
            },
            {
              icon: 'delete',
              tooltip: 'Delete User',
              onClick: (event, rowData) => {}
            }
          ]}
        />

      </Paper>
      <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To subscribe to this website, please enter your email address
              here. We will send updates occasionally.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Email Address"
              type="email"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleClose} color="primary">
              Subscribe
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

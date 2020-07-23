import './index.css';

import { Button, Divider, Form, Message, Select } from 'semantic-ui-react';
import { Dispatch, bindActionCreators } from 'redux';
import { OrNull, User } from '../../types';
import {
  RegisterStatusState,
  registerUser,
} from '../../shared/reducers/user/registerStatus';

import { Paper } from '@material-ui/core';
import React from 'react';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { RoleEnum } from '../../enums';
import { ServerRequestAction } from 'src/newStructure/shared/reducers/utils';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';
import { getHealthFacilityList } from '../../shared/reducers/healthFacilities';

const initState = {
  user: {
    email: ``,
    password: ``,
    firstName: ``,
    healthFacilityName: ``,
    role: `VHT`, // default value
  },
};
interface IProps {
  loggedIn: boolean;
  registerUser: (data: User) => (dispatch: Dispatch) => ServerRequestAction;
  getCurrentUser: () => (dispatch: Dispatch) => ServerRequestAction;
  getHealthFacilityList: () => (dispatch: Dispatch) => ServerRequestAction;
  user: OrNull<User>;
  healthFacilityList: Array<any>;
  registerStatus: RegisterStatusState;
}

class SignupComponent extends React.Component<IProps> {
  state = initState;

  componentDidMount = () => {
    if (!this.props.loggedIn) {
      this.props.getCurrentUser();
    }
    if (
      !this.props.healthFacilityList ||
      !this.props.healthFacilityList.length
    ) {
      this.props.getHealthFacilityList();
    }
  };

  static getDerivedStateFromProps = (props: IProps) => {
    return props.registerStatus.userCreated ? initState : null;
  };

  handleChange = (event: any) => {
    this.setState({
      user: {
        ...this.state.user,
        [event.target.name]: event.target.value,
      },
    });
  };

  handleSelectChange = (e: any, value: any) => {
    this.setState({ user: { ...this.state.user, [value.name]: value.value } });
  };

  handleSubmit = (event: any) => {
    event.preventDefault();
    this.props.registerUser((this.state.user as unknown) as User);
  };

  render() {
    // only admins can see this page
    if (
      this.props.user?.roles === undefined ||
      !this.props.user?.roles.includes(RoleEnum.ADMIN)
    ) {
      return (
        <Message warning>
          <Message.Header>Only Admins can enter this page</Message.Header>
          <p>Please login with an Admin account</p>
        </Message>
      );
    }

    // construct health facilities list object for dropdown
    const hfOptions = [];
    if (
      this.props.healthFacilityList !== undefined &&
      this.props.healthFacilityList.length > 0
    ) {
      for (let i = 0; i < this.props.healthFacilityList.length; i++) {
        hfOptions.push({
          key: this.props.healthFacilityList[i],
          text: this.props.healthFacilityList[i],
          value: this.props.healthFacilityList[i],
        });
      }
    }

    return (
      <div>
        <div>
          <Paper
            style={{
              padding: '35px 25px',
              borderRadius: '15px',
              minWidth: '500px',
              maxWidth: '750px',
              margin: 'auto',
            }}>
            <Form onSubmit={this.handleSubmit}>
              <h1>Create a User</h1>

              <label>Email</label>
              <input
                required
                name="email"
                type="email"
                value={this.state.user.email}
                onChange={this.handleChange}
              />
              <br />
              <label>First Name</label>
              <input
                required
                pattern="[a-zA-Z]*"
                minLength={2}
                maxLength={30}
                name="firstName"
                type="text"
                value={this.state.user.firstName}
                onChange={this.handleChange}
              />
              <br />
              <label>Password</label>
              <input
                required
                minLength={5}
                maxLength={35}
                type="password"
                name="password"
                value={this.state.user.password}
                onChange={this.handleChange}
              />
              <br />
              <label>Role</label>
              <select onChange={this.handleChange} name="role" required>
                <option value="VHT">VHT</option>
                <option value="HCW">HCW</option>
                <option value="CHO">CHO</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <Form.Field
                required
                name="healthFacilityName"
                control={Select}
                value={this.state.user.healthFacilityName}
                label="Health Facility"
                options={hfOptions}
                placeholder="Health Facility"
                onChange={this.handleSelectChange}
              />
              <Divider />
              <div className="flexbox">
                <Button style={{ backgroundColor: '#84ced4' }} type="submit">
                  Submit
                </Button>
              </div>
            </Form>
          </Paper>
        </div>
        {this.props.registerStatus.error && (
          <Message negative size="large">
            <Message.Header>{this.props.registerStatus.message}</Message.Header>
          </Message>
        )}

        {this.props.registerStatus.error === false &&
          this.props.registerStatus.userCreated === true && (
            <Message success size="large">
              <Message.Header>
                {this.props.registerStatus.message}
              </Message.Header>
            </Message>
          )}
      </div>
    );
  }
}

const mapStateToProps = ({ user, healthFacilities }: ReduxState) => ({
  loggedIn: user.current.loggedIn,
  user: user.current.data,
  registerStatus: user.registerStatus,
  healthFacilityList: healthFacilities.data,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      getCurrentUser,
      getHealthFacilityList,
      registerUser,
    },
    dispatch
  );
};

export const SignUpPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignupComponent);

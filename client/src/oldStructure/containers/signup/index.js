import React, {Component} from 'react';
import { connect } from 'react-redux'
import { registerUser, registerUserDefault } from '../../actions/users'
import { getCurrentUser } from '../../actions/users'
import { getHealthFacilityList, getHealthFacilityListRequested } from '../../actions/healthFacilities'
import { Button,
  Divider, Form, Select,
  Message
} from 'semantic-ui-react'
import { Paper } from '@material-ui/core';

const initState = {
  user: {
    email: "",
    password: "",
    firstName: "",
    healthFacilityName: "",
    role: "VHT" // default value
  }
}

class Signup extends Component {
  state = initState

  handleChange = event => {
    this.setState({ user: {
        ...this.state.user,
        [event.target.name]: event.target.value
      }
    });
  }

  handleSelectChange = (e, value) => {
    this.setState({user: { ...this.state.user, [value.name] : value.value } })
  }

  handleSubmit = event => {
    event.preventDefault()
    console.log('submitted!')
    this.props.registerUser(this.state.user)
    // TODO: think of better way to reset fields than using timer
  }

  componentDidMount = () => {
    this.props.getCurrentUser()
    this.props.getHealthFacilityList()
  }

  static getDerivedStateFromProps = (props, state) => {
    if (props.registerStatus.userCreated) {
      props.registerUserDefault()
      return initState
    }
  }

  render() {
    // only admins can see this page
    if (this.props.user.roles === undefined || !this.props.user.roles.includes('ADMIN')) {
      return  <Message warning>
                <Message.Header>Only Admins can enter this page</Message.Header>
                <p>Please login with an Admin account</p>
              </Message>
    }

    // construct health facilities list object for dropdown
    let hfOptions = [];
    if (this.props.healthFacilityList !== undefined && this.props.healthFacilityList.length > 0) {
      for (var i = 0; i < this.props.healthFacilityList.length; i++) {
        hfOptions.push({'key'  : this.props.healthFacilityList[i],
                        'text' : this.props.healthFacilityList[i],
                        'value': this.props.healthFacilityList[i]
                      })
      }
    }

    return (
      <div>
        {this.props.registerStatus.error &&
          (<Message negative size="large">
            <Message.Header>{this.props.registerStatus.message}</Message.Header>
          </Message>)
        }
        {this.props.registerStatus.error === false &&
          (<Message success size="large">
            <Message.Header>{this.props.registerStatus.message}</Message.Header>
          </Message>)
        }
        <div>
          <Paper style={{"padding" : "35px 25px", "borderRadius" : "15px", "minWidth" : "500px", "maxWidth" : "750px", "margin": "auto"}}>
            <Form onSubmit={this.handleSubmit}>
              <h1>Create a User</h1>

              <label>Email</label>
              <input
                required
                name='email'
                type='email'
                value={this.state.user.email}
                onChange={this.handleChange}
                />
              <br/>
              <label>First Name</label>
              <input
                required
                pattern="[a-zA-Z]*"
                minLength='2'
                maxLength='30'
                name='firstName'
                type='text'
                value={this.state.user.firstName}
                onChange={this.handleChange}
                />
              <br/>
              <label>Password</label>
              <input
                required
                minLength='5'
                maxLength='35'
                type='password'
                name='password'
                value={this.state.user.password}
                onChange={this.handleChange}
                />
              <br/>
              <label>Role</label>
              <select onChange={this.handleChange} name='role' required>
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
                label='Health Facility'
                options={hfOptions}
                placeholder='Health Facility'
                onChange={this.handleSelectChange}
              />
              <Divider />
              <div className="flexbox">
                <Button style={{"backgroundColor" : "#84ced4"}} type='submit'>Submit</Button>
              </div>
            </Form>
          </Paper>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ user, healthFacilities }) => ({
  user : user.currentUser,
  registerStatus : user.registerStatus,
  healthFacilityList: healthFacilities.healthFacilitiesList
})

const mapDispatchToProps = dispatch => ({
  getHealthFacilityList: () => {
    dispatch(getHealthFacilityListRequested())
    dispatch(getHealthFacilityList())
  },
  registerUser: user => {
    dispatch(registerUser(user))
  },
  getCurrentUser: () => {
    dispatch(getCurrentUser())
  },
  registerUserDefault: () => {
    dispatch(registerUserDefault())
  }
})
  

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup)

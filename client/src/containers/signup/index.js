import React, {Component} from 'react';
import { push } from 'connected-react-router'
import { Route, Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { userPostFetch } from '../../actions/users'
import { getCurrentUser } from '../../actions/users'
import { getHealthFacilityList } from '../../actions/healthFacilities'
import { Button,
  Header, Icon, Modal,
  Divider, Form, Select,
  Input, Dropdown, Message
} from 'semantic-ui-react'
import { Paper, Snackbar, IconButton } from '@material-ui/core';

class Signup extends Component {
  state = {
    user: {
      email: "",
      password: "",
      firstName: "",
      healthFacilityName: "",
      role: "VHT" // default value
    }
  }

  handleChange = event => {
    console.log(event.target.value)
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
    this.props.userPostFetch(this.state.user).then( () => {
      // reset fields
      if (this.props.registerStatus.error === false) {
          this.setState({
            user: {
              email: "",
              password: "",
              firstName: "",
              role: "VHT" // default value
          }
        })
      }
    })
  }

  

  componentDidMount = () => {
    this.props.getCurrentUser()
    this.props.getHealthFacilityList()
  }

  render() {
    // only admins can see this page
    if (this.props.user.roles == undefined || !this.props.user.roles.includes('ADMIN')) {
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
                name='email'
                type='email'
                value={this.state.user.email}
                onChange={this.handleChange}
                />
              <br/>
              <label>First Name</label>
              <input
                name='firstName'
                type='text'
                value={this.state.user.firstName}
                onChange={this.handleChange}
                />
              <br/>
              <label>Password</label>
              <input
                type='password'
                name='password'
                value={this.state.user.password}
                onChange={this.handleChange}
                />
              <br/>
              <label>Role</label>
              <select onChange={this.handleChange} name='role'>
                <option value="VHT">VHT</option>
                <option value="HCW">HCW</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <Form.Field
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

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      userPostFetch,
      getCurrentUser,
      getHealthFacilityList
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup)

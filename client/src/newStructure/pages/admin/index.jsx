import {
  Button,
  Dropdown,
  Form,
  Header,
  Icon,
  Input,
  Message,
  Modal,
  Select
} from 'semantic-ui-react'
import React, {Component} from 'react';
import {
  deleteUser,
  deleteUserRequested,
  getUsers,
  getUsersRequested,
  updateUser,
  updateUserRequested
} from '../../shared/reducers/user/allUsers'
import {
  getCurrentUser,

} from '../../shared/reducers/user/currentUser'
import{
  getVhtList,
  getVhtsRequested
} from '../../shared/reducers/user/allVhts'

import { getHealthFacilityList, getHealthFacilityListRequested } from '../../shared/reducers/healthFacilities'

import MaterialTable from 'material-table';
import { connect } from 'react-redux'

const options = [
  { key: 'vht', text: 'VHT', value: 1 },
  { key: 'hcw', text: 'HCW', value: 2 },
  { key: 'admin', text: 'ADMIN', value: 3 },
  { key: 'cho', text: 'CHO', value: 4 }
]

class AdminPageComponent extends Component {
  state = {
    columns: [
      {
        title: 'Actions',
        render: rowData => {
          if (rowData.email === 'admin@admin.com') {
            return <div></div>
          }
          return (
            rowData.email !== this.props.user.email && (
              <span>
                <Icon
                  onClick={() => this.openUserEditModal(rowData)}
                  style={{ cursor: 'pointer' }}
                  name="pencil"
                  size="large"
                />
                <Icon
                  onClick={() => this.openConfirmDeleteModal(rowData)}
                  style={{ cursor: 'pointer', marginLeft: '15px' }}
                  name="user delete"
                  size="large"
                />
              </span>
            )
          )
        }
      },
      { title: 'First Name', field: 'firstName', sorting: false },
      { title: 'Email', field: 'email' },
      { title: 'Health Facility', field: 'healthFacilityName' },
      {
        title: 'Roles',
        field: 'roleIds',
        render: rowData => <p>{this.getRoles(rowData.roleIds)}</p>
      }
    ],
    data: [],
    roleMapping: { 1: 'VHT', 2: 'HCW', 3: 'ADMIN', 4: 'CHO' },
    displayUserEditModal: false,
    displayConfirmDeleteModal: false,
    selectedUser: {
      dropdownSelections: [],
      vhtDropdownSelections: [],
      roleIds: []
    }
  }

  handleSelectChange = (e, value) => {
    this.setState({
      selectedUser: { ...this.state.selectedUser, [value.name]: value.value }
    })
  }

  handleDropdownChange = (e, value) => {
    this.setState({
      selectedUser: {
        ...this.state.selectedUser,
        dropdownSelections: value.value
      }
    })
  }

  handleVhtDropdownChange = (e, value) => {
    this.setState({
      selectedUser: {
        ...this.state.selectedUser,
        vhtDropdownSelections: value.value
      }
    })
  }

  openUserEditModal = rowData => {
    this.setState({
      displayUserEditModal: true,
      selectedUser: {
        ...rowData,
        dropdownSelections: rowData.roleIds,
        vhtDropdownSelections: rowData.vhtList
      }
    })
  }

  closeUserEditModal = () => {
    this.setState({
      displayUserEditModal: false,
      selectedUser: {
        dropdownSelections: [],
        vhtDropdownSelections: [],
        roleIds: []
      }
    })
  }

  openConfirmDeleteModal = rowData => {
    this.setState({
      displayConfirmDeleteModal: true,
      selectedUser: { ...rowData }
    })
  }

  closeConfirmDeleteModal = () => {
    this.setState({
      displayConfirmDeleteModal: false,
      selectedUser: {
        dropdownSelections: [],
        vhtDropdownSelections: [],
        roleIds: []
      }
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    let userData = JSON.parse(JSON.stringify(this.state.selectedUser)) // pass by value
    let userId = userData.id

    // delete any uncessary user fields
    delete userData['referrals']
    delete userData['roleIds']
    delete userData['id']
    delete userData['tableData']
    delete userData['healthFacility']
    delete userData['vhtList']

    userData['newRoleIds'] = userData['dropdownSelections']
    delete userData['dropdownSelections']

    userData['newVhtIds'] = userData['vhtDropdownSelections']
    delete userData['vhtDropdownSelections']

    // let userJSON = JSON.stringify( userData, null, 2 )

    this.props.updateUser(userId, userData)
    this.closeUserEditModal()
  }

  handleDelete = event => {
    event.preventDefault()
    let userData = JSON.parse(JSON.stringify(this.state.selectedUser)) // pass by value
    let userId = userData.id

    this.props.deleteUser(userId)
    this.closeConfirmDeleteModal()
  }

  componentDidMount = () => {
    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser()
    }
    if (!this.props.usersList || !this.props.healthFacilityList) {
      this.props.getUsers()
      this.props.getHealthFacilityList()
    }
    this.props.getVhtList()
  }

  static getDerivedStateFromProps = (props, state) => {
    if (props.updateUserList) {
      props.getUsers()
    }
    return state
  }

  getRoles = roleIds => {
    var roleStr = ''
    if (roleIds.length === 1) {
      return this.state.roleMapping[roleIds[0]]
    }

    for (var i = 0; i < roleIds.length; i++) {
      roleStr += this.state.roleMapping[roleIds[i]] + '\n'
    }
    return roleStr
  }

  getRolesArray = roleIds => {
    var roles = []

    if (roleIds.length === 1) {
      var roleName = this.state.roleMapping[roleIds[0]]
      roles.push(roleName)
      return [...roles]
    }

    for (var i = 0; i < roleIds.length; i++) {
      roles.push(this.state.roleMapping[roleIds[i]])
    }

    return [...roles]
  }

  render() {
    // construct health facilities list object for dropdown
    let hfOptions = []

    if (
      this.props.healthFacilityList !== undefined &&
      this.props.healthFacilityList.length > 0
    ) {
      for (var i = 0; i < this.props.healthFacilityList.length; i++) {
        hfOptions.push({
          key: this.props.healthFacilityList[i],
          text: this.props.healthFacilityList[i],
          value: this.props.healthFacilityList[i]
        })
      }
    }

    let vhtOptions = []
    if (this.props.vhtList !== undefined && this.props.vhtList.length > 0) {
      for (var j = 0; j < this.props.vhtList.length; j++) {
        vhtOptions.push({
          key: this.props.vhtList[j].id,
          text: this.props.vhtList[j].email,
          value: this.props.vhtList[j].id
        })
      }
    }

    // only admins can see this page
    if (
      this.props.user.roles === undefined ||
      !this.props.user.roles.includes('ADMIN')
    ) {
      return (
        <Message warning>
          <Message.Header>Only Admins can enter this page</Message.Header>
          <p>Please login with an Admin account</p>
        </Message>
      )
    }

    return (
      <div>
        <h1>Admin Panel</h1>
        <MaterialTable
          title="Manage Users"
          isLoading={this.props.isLoading}
          columns={this.state.columns}
          data={this.props.usersList}
          options={{
            rowStyle: rowData => {
              return {
                height: '75px'
              }
            },
            pageSize: 10
          }}
        />

        <Modal
          closeIcon
          onClose={this.closeUserEditModal}
          open={this.state.displayUserEditModal}>
          <Modal.Header>User Information</Modal.Header>
          <Modal.Content scrolling>
            <Modal.Description>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group widths="equal">
                  <Form.Field
                    name="firstName"
                    control={Input}
                    value={this.state.selectedUser.firstName}
                    label="Name"
                    placeholder="First Name"
                    onChange={this.handleSelectChange}
                  />
                  <Form.Field
                    name="email"
                    control={Input}
                    value={this.state.selectedUser.email}
                    label="Name"
                    placeholder="Email"
                    onChange={this.handleSelectChange}
                  />
                  <Form.Field
                    name="healthFacilityName"
                    control={Select}
                    value={this.state.selectedUser.healthFacilityName}
                    label="Health Facility"
                    options={hfOptions}
                    placeholder="Health Facility"
                    onChange={this.handleSelectChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Field label="User Roles">
                    <div></div>
                  </Form.Field>
                  <Dropdown
                    placeholder="Roles"
                    fluid
                    multiple
                    selection
                    options={options}
                    value={this.state.selectedUser.dropdownSelections}
                    onChange={this.handleDropdownChange}
                  />
                </Form.Group>

                {this.state.selectedUser.roleIds.includes(4) && (
                  <Form.Group>
                    <Form.Field label="VHT Supervising">
                      <div></div>
                    </Form.Field>
                    <Dropdown
                      placeholder="VHT Supervising"
                      fluid
                      multiple
                      selection
                      options={vhtOptions}
                      value={this.state.selectedUser.vhtDropdownSelections}
                      onChange={this.handleVhtDropdownChange}
                    />
                  </Form.Group>
                )}
                <Form.Field style={{ marginTop: '50px' }} control={Button}>
                  Update User
                </Form.Field>
              </Form>
            </Modal.Description>
          </Modal.Content>
        </Modal>

        <Modal
          basic
          size="small"
          closeIcon
          onClose={this.closeConfirmDeleteModal}
          open={this.state.displayConfirmDeleteModal}>
          <Header icon="archive" content="Confirm Deleting User" />
          <Modal.Content>
            <p>Are you sure you want to delete the User:</p>
            <p>First Name: {this.state.selectedUser.firstName}</p>
            <p>Email: {this.state.selectedUser.email}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button
              basic
              color="red"
              inverted
              onClick={() => this.closeConfirmDeleteModal()}>
              <Icon name="remove" /> No
            </Button>
            <Button color="green" inverted onClick={this.handleDelete}>
              <Icon name="checkmark" /> Yes
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = ({ user, healthFacilities }) => ({
  user: user.currentUser,
  isLoading: user.allUsers.isLoading,
  updateUserList: user.allUsers.updateUserList,
  usersList: user.allUsers.usersList,
  vhtList: user.allVhts.vhtList,
  healthFacilityList: healthFacilities.healthFacilitiesList
})

const mapDispatchToProps = dispatch => ({
  getHealthFacilityList: () => {
    dispatch(getHealthFacilityListRequested())
    dispatch(getHealthFacilityList())
  },
  getUsers: () => {
    dispatch(getUsersRequested())
    dispatch(getUsers())
  },
  getVhtList: () => {
    dispatch(getVhtsRequested())
    dispatch(getVhtList())
  },
  updateUser: (userId, userData) => {
    dispatch(updateUserRequested())
    dispatch(updateUser(userId, userData))
  },
  deleteUser: userId => {
    dispatch(deleteUserRequested())
    dispatch(deleteUser(userId))
  },
  getCurrentUser: () => {
    dispatch(getCurrentUser())
  }
})

export const AdminPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminPageComponent)

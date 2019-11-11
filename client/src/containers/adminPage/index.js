import React, {Component} from 'react';
import MaterialTable from 'material-table';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getCurrentUser } from '../../actions/users'
import { getUsers } from '../../actions/users'
import { updateUser } from '../../actions/users'
import { Button,
  Header, Icon, Modal,
  Divider, Form, Select,
  Input, Dropdown, Message
} from 'semantic-ui-react'


// NOTE: hard coded health facilities
// TODO: get list of health facilities from backend
const hfOptions = [
  { key: '1', text: 'H1233', value: 'H1233' },
  { key: '2', text: 'H2555', value: 'H2555' },
  { key: '3', text: 'H3445', value: 'H3445' },
  { key: '4', text: 'H5123', value: 'H5123' },
]

const options = [
  { key: 'vht', text: 'VHT', value: 1 },
  { key: 'hcw', text: 'HCW', value: 2 },
  { key: 'admin', text: 'ADMIN', value: 3 },
]

class AdminPage extends Component {

  state = {
    columns: [
    {   title: 'Actions', render: rowData => {
        return (
          (rowData.email !== "admin@admin.com" || rowData.email !== this.props.user.email) &&
            <span>
              <Icon onClick={() => this.openUserEditModal(rowData)} style={{ "cursor": "pointer"}} name="pencil" size="large"/>
              <Icon style={{ "cursor": "pointer", "marginLeft" : "15px"}} name="user delete" size="large"/>
            </span>)}
    },
    {   title: 'First Name',
        field: 'firstName',
        sorting: false
    },
    {   title: 'Email', field: 'email' },
    {   title: 'Health Facility', field: 'healthFacilityName'},
    {   title: 'Roles', field: 'roleIds',
        render: rowData => <p>{this.getRoles(rowData.roleIds)}</p>}],
    data: [],
    roleMapping: { 1: 'VHT', 2: 'HCW', 3: 'ADMIN'},
    displayUserEditModal: false,
    selectedUser : { dropdownSelections: [] },
  }

  handleSelectChange = (e, value) => {
    this.setState({'selectedUser': { ...this.state.selectedUser, [value.name] : value.value } })
  }

  handleDropdownChange = (e, value) => {
    this.setState({'selectedUser': { ...this.state.selectedUser, dropdownSelections : value.value } })
  }

  openUserEditModal = (rowData) => {
    console.log(rowData)
    this.setState({ displayUserEditModal: true, selectedUser: { ...rowData, dropdownSelections: rowData.roleIds} } )
  }

  closeUserEditModal = () => {
    console.log(this.state.selectedUser)
    this.setState({ displayUserEditModal: false, selectedUser: {} })
  }

  handleSubmit = (event) => {
    event.preventDefault();
    let userData = JSON.parse(JSON.stringify(this.state.selectedUser)) // pass by value
    let userId = userData.id

    // delete any uncessary user fields
    delete userData['referrals']
    delete userData['roleIds']
    delete userData['id']
    delete userData['tableData']
    delete userData['healthFacility']

    userData['newRoleIds'] = userData['dropdownSelections']
    delete userData['dropdownSelections']
    
    let userJSON = JSON.stringify( userData, null, 2 )

    console.log(userJSON)
    this.props.updateUser(userId,userData)
    this.closeUserEditModal()
  }

  componentDidMount = () => {
    this.props.getCurrentUser().then((err) => {
      if (err !== undefined) {
        // error from getCurrentUser(), don't get users
        return
      }
      
      this.props.getUsers()
    })
  }

  getRoles = (roleIds) => {
    var roleStr = "";
    if (roleIds.length == 1) {
      return this.state.roleMapping[roleIds[0]]
    }

    for (var i = 0; i < roleIds.length; i++) {
      roleStr += this.state.roleMapping[roleIds[i]] + "\n"
    }
    return roleStr
  }

  getRolesArray = (roleIds) => {
    var roles = [];

    if (roleIds.length == 1) {
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
    // only admins can see this page
    if (this.props.user.role != 'ADMIN') {
      return  <Message warning>
                <Message.Header>Only Admins can enter this page</Message.Header>
                <p>Please login with an Admin account</p>
              </Message>
    }

    return (
      <div>
        <MaterialTable
            title="Admin Panel"
            isLoading={this.props.isLoading}
            columns={this.state.columns}
            data={this.props.usersList}
            options={{
                rowStyle: rowData => {
                    return {
                        height: '75px',
                    }
                },
                pageSize: 10
            }}
        />

        <Modal closeIcon onClose={this.closeUserEditModal} open={this.state.displayUserEditModal}>
            <Modal.Header>User Information</Modal.Header>
            <Modal.Content scrolling>
            <Modal.Description>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group widths='equal'>
                  <Form.Field
                    name="firstName"
                    control={Input}
                    value={this.state.selectedUser.firstName}
                    label='Name'
                    placeholder='First Name'
                    onChange={this.handleSelectChange}
                  />
                  <Form.Field
                    name="email"
                    control={Input}
                    value={this.state.selectedUser.email}
                    label='Name'
                    placeholder='Email'
                    onChange={this.handleSelectChange}
                  />
                  <Form.Field
                    name="healthFacilityName"
                    control={Select}
                    value={this.state.selectedUser.healthFacilityName}
                    label='Health Facility'
                    options={hfOptions}
                    placeholder='Gender'
                    onChange={this.handleSelectChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Field
                    label='User Roles'
                  ><div></div></Form.Field>
                  <Dropdown placeholder='Roles' fluid multiple selection
                    options={options}
                    value={this.state.selectedUser.dropdownSelections}
                    onChange={this.handleDropdownChange }/>
                  
                </Form.Group>
                <Form.Field style={{"marginTop" : "50px"}} control={Button}>Update User</Form.Field>
              </Form>

            </Modal.Description>
          </Modal.Content>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user : user.currentUser,
  isLoading: user.allUsers.isLoading,
  usersList : user.allUsers.usersList,
  registerStatus : user.registerStatus
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getCurrentUser,
      getUsers,
      updateUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminPage)

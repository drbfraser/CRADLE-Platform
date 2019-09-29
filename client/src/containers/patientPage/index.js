import React, {Component} from 'react';
import MaterialTable from 'material-table';
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatients } from '../../actions/patients';
import { getCurrentUser } from '../../actions/users';
import { getPosts } from '../../actions/posts';

import { Button,
  Header, Image, Modal,
  Divider, Form, Select,
  Input, TextArea
} from 'semantic-ui-react'

const sexOptions = [
  { key: 'm', text: 'Male', value: 'M' },
  { key: 'f', text: 'Female', value: 'F' },
  { key: 'o', text: 'Other', value: 'I' },
]

const pregOptions = [
  { key: 'y', text: 'Yes', value: true },
  { key: 'n', text: 'No', value: false },
]

class PatientPage extends Component {
  state = {
    columns: [
      { title: 'Patient ID', field: 'patientId', defaultSort: 'asc' },
      { title: 'Patient Name', field: 'patientName',
        render: rowData => 
          <div>
            <p>{rowData.patientName}</p>
            <a onClick={() => this.openModal({rowData})}>View Info</a>
          </div>  
      },
      { title: 'Readings', render: rowData => <a onClick={() => console.log(`clicked ${rowData}`)}>View Readings</a>},
      { title: 'Follow Up Status', field: 'followUp',
        render: rowData => rowData.isPregnant ? (<button>Follow Up</button>) : (<p>Not needed</p>) },
    ],
    data: [],
    selectedPatient: { patientId: '', patientName: 'Test', 
                       patientSex: 'F', medicalHistory: '',
                       drugHistory: '', villageNumber:''
                      },
    displayModal: false
  }

  componentDidMount = () => {
    console.log('componentDidMount')
    this.props.getCurrentUser().then((err) => {
      if (err !== undefined) {
        // error from getCurrentUser(), don't get patients
        return
      }
      this.props.getPatients()
    })
  }

  handleSelectChange = (e, value) => {
    console.log(value)
    this.setState({'selectedPatient': { ...this.state.selectedPatient, [value.name] : value.value } })
  }

  openModal = (patientData) => {
    console.log(patientData)
    console.log('open modal')
    this.setState({ displayModal: true, selectedPatient: patientData['rowData'] })
  }

  closeModal = () => {
    console.log('close modal')
    this.setState({ displayModal: false })
  }
  
  handleSubmit = (event) => {
    event.preventDefault();
    let patientData = this.state.selectedPatient

    // delete any unnecessary fields
    delete patientData.readings
    delete patientData.tableData
    delete patientData.patientId

    let patientJSON = JSON.stringify({ 'patient' : patientData });
    console.log(patientJSON)

    // TODO: make request to update patient record
  }

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    return (
        <div >
          <h1>Patients List</h1>
          <p> only logged in users are allowed to see this </p>
          <MaterialTable
            title="Patients Table"
            columns={this.state.columns}
            data={this.props.data}
            editable={{
              onRowAdd: newData =>
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    const data = [...this.state.data];
                    data.push(newData);
                    this.setState({ ...this.state, data });
                  }, 600);
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    const data = [...this.state.data];
                    data[data.indexOf(oldData)] = newData;
                    this.setState({ ...this.state, data });
                  }, 600);
                }),
              onRowDelete: oldData =>
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    const data = [...this.state.data];
                    data.splice(data.indexOf(oldData), 1);
                    this.setState({ ...this.state, data });
                  }, 600);
                }),
            }}
          />

          <Modal closeIcon onClose={this.closeModal} open={this.state.displayModal}>
            <Modal.Content scrolling>
              <Modal.Description>
                <Header>Patient #{this.state.selectedPatient.patientId}</Header>
                <Divider />
                <Form onSubmit={this.handleSubmit}>
                  <Form.Group widths='equal'>
                    <Form.Field
                      name="patientName"
                      value={this.state.selectedPatient.patientName}
                      control={Input}
                      label='Name'
                      placeholder='Patient Name'
                      onChange={this.handleSelectChange}
                    />
                    <Form.Field
                      name="patientAge"
                      value={this.state.selectedPatient.patientAge}
                      control={Input}
                      label='Age'
                      placeholder='Patient age'
                      onChange={this.handleSelectChange}
                    />
                    <Form.Field
                      name="patientSex"
                      control={Select}
                      value={this.state.selectedPatient.patientSex}
                      label='Gender'
                      options={sexOptions}
                      placeholder='Gender'
                      onChange={this.handleSelectChange}
                    />
                  </Form.Group>
                  <Form.Group widths='equal'>
                    <Form.Field
                      name='villageNumber'
                      value={this.state.selectedPatient.villageNumber}
                      control={Input}
                      label='Village Number'
                      placeholder='Village Number'
                      onChange={this.handleSelectChange}
                    />
                    <Form.Field
                      name='isPregnant'
                      value={this.state.selectedPatient.isPregnant}
                      control={Select}
                      label='Pregant'
                      options={pregOptions}
                      onChange={this.handleSelectChange}
                    />
                  </Form.Group>
                  <Form.Field
                    name="drugHistory"
                    value={this.state.selectedPatient.drugHistory || ''}
                    control={TextArea}
                    label='Drug History'
                    placeholder="Patient's drug history..."
                    onChange={this.handleSelectChange}
                  />
                  <Form.Field
                    name="medicalHistory"
                    value={this.state.selectedPatient.medicalHistory || ''}
                    control={TextArea}
                    label='Medical History'
                    placeholder="Patient's medical history..."
                    onChange={this.handleSelectChange}
                  />
                  <Form.Field control={Button}>Submit</Form.Field>
                </Form>

              </Modal.Description>
            </Modal.Content>
          </Modal>

        </div>

    )
  }
}

const mapStateToProps = ({ patients, user }) => ({
  patients : patients,
  data : patients.patientsList,
  user : user.currentUser
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getPatients,
      getCurrentUser,
      getPosts
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PatientPage)

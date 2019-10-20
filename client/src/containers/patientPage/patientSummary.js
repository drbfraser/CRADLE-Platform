import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Icon } from 'semantic-ui-react'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { updatePatient } from '../../actions/patients'
import { getPatients } from '../../actions/patients'



import { Button,
  Header, Image, Modal,
  Divider, Form, Select,
  Input, TextArea, Item
} from 'semantic-ui-react'

const sexOptions = [
  { key: 'm', text: 'Male', value: 'MALE' },
  { key: 'f', text: 'Female', value: 'FEMALE' },
  { key: 'o', text: 'Other', value: 'I' },
]

const pregOptions = [
  { key: 'y', text: 'Yes', value: true },
  { key: 'n', text: 'No', value: false },
]

class PatientSummary extends Component {

  state = {
    displayPatientModal: false,
    selectedPatient: {},
  }

  componentDidMount = () => {
    this.setState({ 'selectedPatient' : this.props.selectedPatient })
  }

  handleBackBtn = () => {
    // go back to patient table
    this.props.callbackFromParent(false)
  }

  openPatientModal = () => {
    console.log('open patient modal')
    this.setState({ displayPatientModal: true })
  }

  closePatientModal = () => {
    console.log('close patient modal')
    this.setState({ displayPatientModal: false })
  }

  handleSubmit = (event) => {
    event.preventDefault();
    let patientData = JSON.parse(JSON.stringify(this.state.selectedPatient)) // pass by value
    let patientId = patientData.patientId
  

    // delete any unnecessary fields
    delete patientData.readings
    delete patientData.tableData
    delete patientData.patientId

    let patientJSON = JSON.stringify( patientData );
    console.log(patientJSON)
    
    this.props.updatePatient(patientId,patientData)
    this.closePatientModal()


  }

  handleSelectChange = (e, value) => {
    console.log(value)
    this.setState({'selectedPatient': { ...this.state.selectedPatient, [value.name] : value.value } })
  }

  createReadings = (dateTimeTaken, bpDiastolic, bpSystolic, heartRateBPM, symptoms) => {
    return { dateTimeTaken, bpDiastolic, bpSystolic, heartRateBPM, symptoms }
  }


  render() {
    let readings = [];

    if (this.props.selectedPatient.readings.length > 0) {
      for (var i = 0; i < this.props.selectedPatient.readings.length; i++) {
        const dateTimeTaken = this.props.selectedPatient.readings[i]['dateTimeTaken']
        const bpDiastolic = this.props.selectedPatient.readings[i]['bpDiastolic']
        const bpSystolic = this.props.selectedPatient.readings[i]['bpSystolic']
        const heartRateBPM = this.props.selectedPatient.readings[i]['heartRateBPM']
        const symptoms = this.props.selectedPatient.readings[i]['symptoms']
        readings.push(this.createReadings(dateTimeTaken, bpDiastolic, bpSystolic, heartRateBPM, symptoms))
      }
    }

    return (
      <div>
      {this.state.selectedPatient ? (
        <div >
          <h1>
            <Icon style={{"cursor" : "pointer", "line-height" : "0.7em"}} size="large" name="chevron left" onClick={() => this.handleBackBtn() }/>
            Patient Summary : {this.state.selectedPatient.patientName}
          </h1>
          <Divider />

          <Grid container direction="row" spacing={4} >
            <Grid item xs={6} style={{"minWidth" : "500px"}} >
              <Paper style={{"padding" : "35px 25px", "borderRadius" : "15px"}}>
                <Typography variant="h5" component="h3">
                  Medical Information
                </Typography>
                <Divider />
                <div style={{"padding" : "20px 50px"}}>
                  <p><b>Patient ID: </b> {this.state.selectedPatient.patientId} </p>
                  <p><b>Patient Age: </b> {this.state.selectedPatient.patientAge} </p>
                  <p><b>Patient Sex: </b> {this.state.selectedPatient.patientSex} </p>
                  <p><b>Pregant: </b> {this.state.selectedPatient.isPregnant ? "Yes" : "No"} </p>
                  <ExpansionPanel>
                    <ExpansionPanelSummary
                      expandIcon={<Icon name="chevron down" />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>Medical History</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                      </Typography>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                  <ExpansionPanel>
                    <ExpansionPanelSummary
                      expandIcon={<Icon name="chevron down" />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>Drug History</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                      </Typography>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                  <Divider />
                  <Button onClick={() => this.openPatientModal() }>Edit Patient</Button>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={6} style={{"minWidth" : "500px", "height": '100%'}} >
              <Paper style={{"padding" : "35px 25px", "borderRadius" : "15px"}}>
                <Typography variant="h5" component="h3">
                  Vitals Over Time
                </Typography>
                <Divider/>
              </Paper>
            </Grid>
          </Grid>
          <br/>
          <Grid container spacing={0}>
          {readings.map(row => (
              <Grid item xs={12}>
              <Paper style={{"marginBottom":"35px", "height":"400px", "padding" : "45px 50px", "borderRadius" : "15px"}}>
                  <div style={{"display": "inline-block", "width":"50%"}}>
                    <Typography variant="h4" component="h4">
                      Reading
                    </Typography>

                    <div style={{"padding" : "15px 50px"}}>
                      <Icon size="huge" name="alarm" />
                      <br/><br/>
                      <p><b>Systolic Blood Pressure: </b> {row.bpSystolic} </p>
                      <p><b>Diastolic Blood Pressure: </b> {row.bpDiastolic} </p>
                      <p><b>Heart Rate (BPM): </b> {row.heartRateBPM} </p>
                      <p><b>Symptoms: </b> {row.symptoms} </p>
                    </div>
                  </div>
                  <div style={{"borderLeft": "2px solid #84ced4", "display": "inline-block", "width":"50%", "float": "right", "height" : "100%"}}>
                    <div style={{"padding" : "15px 50px"}}>
                      <Typography variant="h4" component="h4">
                        Assessment
                      </Typography>
                    </div>
                  </div>
                </Paper>
              </Grid>
            ))}

          </Grid>

          <Modal closeIcon onClose={this.closePatientModal} open={this.state.displayPatientModal}>
            <Modal.Header>Patient Information</Modal.Header>
            <Modal.Content scrolling>
              <Modal.Description>
                <Header>Patient Information for ID #{this.state.selectedPatient.patientId}</Header>
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
      ) : (
        <div>
          <Button onClick={() => this.handleBackBtn() }>Back</Button>
          <h2>No patient selected</h2>
        </div>
      )}
      </div>
    )
  }
}


const mapStateToProps = ({}) => ({})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      updatePatient,
      getPatients
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PatientSummary)

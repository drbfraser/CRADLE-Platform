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
          <Button onClick={() => this.handleBackBtn() }>Back</Button>
          
          <h1>Patient Summary</h1>

          <Divider />

          <Grid container spacing={0} justify="center">
            <Grid item xs={8}>
              <Paper style={{"padding" : "24px 16px"}}>
                <Typography variant="h5" component="h3">
                  Patient Information
                </Typography>
                <Divider />
                <Typography component="p">
                  Patient ID: {this.state.selectedPatient.patientId} <br/>
                  Patient Initials: {this.state.selectedPatient.patientName} <br/>
                  Patient Age: {this.state.selectedPatient.patientAge} <br/>
                  Patient Sex: {this.state.selectedPatient.patientSex} <br/>
                  Pregant: {this.state.selectedPatient.isPregnant ? "Yes" : "No"} <br/>
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
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <br/>
          <Grid container spacing={0}>
            <Grid item xs={12}>
            <Paper style={{"padding" : "24px 16px"}}>
                <Typography variant="h6" component="h6">
                  All Readings
                </Typography>
                <Divider />
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Systolic</TableCell>
                      <TableCell align="right">Diastolic</TableCell>
                      <TableCell align="right">Heart Rate(BPM)</TableCell>
                      <TableCell align="right">Symptoms</TableCell>
                      <TableCell align="right">Date Taken</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {readings.map(row => (
                      <TableRow key={row.dateReferred}>
                        <TableCell component="th" scope="row">
                          {row.bpSystolic}
                        </TableCell>
                        <TableCell align="right">{row.bpDiastolic}</TableCell>
                        <TableCell align="right">{row.heartRateBPM}</TableCell>
                        <TableCell align="right">{row.symptoms}</TableCell>
                        <TableCell align="right">{row.dateTimeTaken}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
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

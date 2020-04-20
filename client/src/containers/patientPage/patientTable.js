import React, { Component } from 'react'
import MaterialTable, { MTableHeader } from 'material-table'
import { getPrettyDate } from '../../utils'
import {
    getTrafficIcon,
    getLatestReading,
    getLatestReadingDateTime,
    sortPatientsByLastReading
} from './patientUtils'
import Switch from '@material-ui/core/Switch'

class PatientTable extends Component {
    state = {
        columns: [
            {
                title: 'Patient Initials',
                field: 'patientName',
                render: rowData => (
                    <p
                        key={'initials' + rowData.tableData.id}
                        style={{
                            fontSize: '200%',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                        {rowData.patientName}
                    </p>
                ),
                headerStyle: {
                    textAlign: 'center'
                },
                sorting: false
            },
            { title: 'Patient ID', field: 'patientId' },
            { title: 'Village', field: 'villageNumber' },
            {
                title: 'Vital Sign',
                cellStyle: {
                    padding: '0px'
                },
                sorting: false,
                render: rowData =>
                    getTrafficIcon(
                        getLatestReading(rowData.readings).trafficLightStatus
                    )
            },
            {
                title: 'Date of Last Reading',
                field: 'lastReading',
                render: rowData => (
                    <p>
                        {getPrettyDate(
                            getLatestReadingDateTime(rowData.readings)
                        )}
                    </p>
                ),
                customSort: (a, b) => sortPatientsByLastReading(a, b),
                defaultSort: 'asc'
            }
        ],
        data: this.props.data,
        selectedPatient: {
            patientId: '',
            patientName: 'Test',
            patientSex: 'F',
            medicalHistory: '',
            drugHistory: '',
            villageNumber: '',
            readings: []
        },
        showReferredPatients: true
    }

    handleSwitchChange(event) {
        this.setState({
            data: this.getPatientsToRender(event.target.checked)
        })
    }

    getPatientsToRender(showReffered) {
        return this.props.data.filter(patient => {
            let hasReferral = this.patientHasReferral(patient.readings)
            if (showReffered) {
                return hasReferral
            } else {
                return !hasReferral
            }
        })
    }

    patientHasReferral(readings) {
        readings.forEach(reading => {
            if (reading.dateReferred) {
                return true
            }
        })
        return false
    }

    render() {
        return (
            <MaterialTable
                title="Patients"
                isLoading={this.props.isLoading}
                columns={this.state.columns}
                data={this.state.data}
                options={{
                    rowStyle: rowData => {
                        return {
                            height: '75px'
                        }
                    },
                    pageSize: 10
                }}
                onRowClick={(e, rowData) =>
                    this.props.callbackFromParent(rowData)
                }
                actions={[
                    {
                        icon: () => {
                            return (
                                <Switch
                                    defaultChecked={true}
                                    onChange={this.handleSwitchChange.bind(
                                        this
                                    )}
                                    color="primary"
                                />
                            )
                        },
                        tooltip: 'Referred Patients',
                        isFreeAction: true
                    }
                ]}
            />
        )
    }
}

export default PatientTable

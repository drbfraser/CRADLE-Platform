import React, { Component } from 'react'
import MaterialTable from 'material-table'
import { getPrettyDate } from '../../utils'
import {
    getTrafficIcon,
    getLatestReading,
    getLatestReadingDateTime,
    sortPatientsByLastReading
} from './patientUtils'

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
                title: 'Last Reading',
                field: 'lastReading',
                render: rowData => (
                    <p>
                        {getPrettyDate(
                            getLatestReadingDateTime(rowData.readings)
                        )}
                    </p>
                ),
                customSort: (a, b) => sortPatientsByLastReading(a, b),
                defaultSort: 'desc'
            }
        ],
        data: [],
        selectedPatient: {
            patientId: '',
            patientName: 'Test',
            patientSex: 'F',
            medicalHistory: '',
            drugHistory: '',
            villageNumber: '',
            readings: []
        }
    }

    render() {
        return (
            <MaterialTable
                title="Patients"
                isLoading={this.props.isLoading}
                columns={this.state.columns}
                data={this.props.data}
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
            />
        )
    }
}

export default PatientTable

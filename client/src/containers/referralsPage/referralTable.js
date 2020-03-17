import React, { Component } from 'react'
import MaterialTable from 'material-table'
import { Icon } from 'semantic-ui-react'
import { getPrettyDate } from '../../utils'
import { getLatestReferral, sortReferralsByDate } from './referralUtils'

class ReferralTable extends Component {
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
                title: 'Date Referred',
                render: rowData => (
                    <p>{getPrettyDate(getLatestReferral(rowData.readings))}</p>
                ),
                customSort: (a, b) => sortReferralsByDate(a, b),
                defaultSort: 'desc'
            },
            {
                title: 'Assessment',
                render: rowData =>
                    rowData.needsAssessment ? (
                        <p>
                            <Icon
                                name="clock outline"
                                size="large"
                                color="red"
                            />{' '}
                            Pending
                        </p>
                    ) : (
                        <p>
                            <Icon name="checkmark" size="large" color="green" />{' '}
                            Complete
                        </p>
                    )
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
                title="Referrals"
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

export default ReferralTable

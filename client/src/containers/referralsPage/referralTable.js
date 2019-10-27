import React, {Component} from 'react';
import MaterialTable from 'material-table';
import moment from 'moment';

class ReferralTable extends Component {
    
    state = {
        columns: [
        {   title: 'Patient Initials',
            field: 'patientName',
            render: rowData => 
                <p key={"initials" + rowData.tableData.id}
                   style={{"fontSize": "200%", "fontWeight" : "bold", "textAlign" : "center"}}
                >{rowData.patientName}</p>,
            headerStyle : {
                textAlign: "center"
            },
            sorting: false
        },
        {   title: 'Patient ID', field: 'patientId' },
        {   title: 'Village No.', field: 'villageNumber'},
        {   title: 'Date Referred',
                render: rowData => <p>{this.getPrettyDate(this.getLatestReferral(rowData.readings))}</p>,
            customSort: (a,b) => this.getMomentDate(this.getLatestReferral(a.readings)).valueOf() - this.getMomentDate(this.getLatestReferral(b.readings)).valueOf(),
            defaultSort: 'desc' },
        {   title: 'Assessment', render: rowData => <p>Pending</p>},
        ],
        data: [],
        selectedPatient: { patientId: '', patientName: 'Test', 
                        patientSex: 'F', medicalHistory: '',
                        drugHistory: '', villageNumber:'', readings: []
                        }
    }

    getLatestReferral = (readings) => {
        let sortedReadings = readings.sort((a,b) => this.getMomentDate(b.dateTimeTaken).valueOf() - this.getMomentDate(a.dateTimeTaken).valueOf())
        return sortedReadings[0].dateReferred
    }

    getPrettyDate = (dateStr) => {
        return this.getMomentDate(dateStr).format("MMMM Do, YYYY");
    }

    getMomentDate = (dateStr) => {
        var dateStr = dateStr.slice(0,19)
        return moment(dateStr);
    }

    render() {

        return (
            <MaterialTable
                title="Referrals Table"
                isLoading={this.props.isLoading}
                columns={this.state.columns}
                data={this.props.data}
                options={{
                    rowStyle: rowData => {
                        return {
                            height: '75px',
                        }
                    },
                    pageSize: 10
                }}
                onRowClick={(e, rowData) => this.props.callbackFromParent(rowData)}
            />
        )
    }
}

export default ReferralTable

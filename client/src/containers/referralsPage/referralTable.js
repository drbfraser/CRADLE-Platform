import React, {Component} from 'react';
import MaterialTable from 'material-table';
import moment from 'moment';
import { Icon } from 'semantic-ui-react'

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
        {   title: 'Assessment', render: rowData => rowData.needsAssessment ? (<p><Icon name="clock outline" size="large" color="red"/> Pending</p>) :
                                                                            (<p><Icon name="checkmark" size="large" color="green"/> Complete</p>)},
        ],
        data: [],
        selectedPatient: { patientId: '', patientName: 'Test', 
                        patientSex: 'F', medicalHistory: '',
                        drugHistory: '', villageNumber:'', readings: []
                        }
    }

    getLatestReferral = (readings) => {
        let sortedReadings = readings.sort((a,b) => this.getMomentDate(b.dateTimeTaken).valueOf() - this.getMomentDate(a.dateTimeTaken).valueOf())
        
        if(sortedReadings[0].dateReferred) {
            return sortedReadings[0].dateReferred
        } else {
            return ""
        }
    }

    getPrettyDate = (dateStr) => {
        return this.getMomentDate(dateStr).format("MMMM Do, YYYY");
    }

    getMomentDate = (dateStr) => {
        dateStr = dateStr.slice(0,19)
        return moment(dateStr);
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

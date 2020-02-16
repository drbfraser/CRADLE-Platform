import React from 'react';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import {Form, Header, Select} from 'semantic-ui-react';

import './index.css'

const resultOptions = [
    { key: 'leucp', text: 'leuc +', value: 'leuc +' },
    { key: 'leucpp', text: 'leuc ++', value: 'leuc ++' },
    { key: 'leucppp', text: 'leuc +++', value: 'leuc +++' },
    { key: 'nitp', text: 'nit +', value: 'nit +' },
    { key: 'nitpp', text: 'nit ++', value: 'nit ++' },
    { key: 'nitppp', text: 'nit +++', value: 'nit +++' },
    { key: 'glup', text: 'glu +', value: 'glu +' },
    { key: 'glupp', text: 'glu ++', value: 'glu ++' },
    { key: 'gluppp', text: 'glu +++', value: 'glu +++' },
    { key: 'prop', text: 'pro +', value: 'pro +' },
    { key: 'propp', text: 'pro ++', value: 'pro ++' },
    { key: 'proppp', text: 'pro +++', value: 'pro +++' },
    { key: 'bloodp', text: 'blood +', value: 'blood +' },
    { key: 'bloodpp', text: 'blood ++', value: 'blood ++' },
    { key: 'bloodppp', text: 'blood +++', value: 'blood +++' },
]

function UrineTestForm(props) {
    return (
        <Paper className='bpCard' style={{ 'padding': '35px 25px', 'borderRadius': '15px', 'minWidth' : '450px' }}>
            <Header>
                <b>Urine Test</b>
                <Switch
                    className='urineTestSwitch'
                    checked={props.hasUrineTest}
                    onChange={props.onSwitchChange}
                    color='primary'
                />
            </Header>
            <div className='urineTest'>
                <Form.Field 
                    name='urineTest'
                    value={props.reading.urineTest}
                    control={Select}
                    label='Test Result'
                    options={resultOptions}
                    placeholder='Test Result'
                    onChange={props.onChange}
                    disabled={!props.hasUrineTest}
                    required
                />
            </div>
        </Paper>
    )
}

export default UrineTestForm
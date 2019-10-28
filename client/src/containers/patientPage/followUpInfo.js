import React from 'react'
import PropTypes from 'prop-types'
import { Divider, Segment, Header} from 'semantic-ui-react';

function FollowUpInfo(props) {
    if (props.followUp) {
        return (
            <Segment>
                <Header size='small'>Follow Up Action:</Header>
                <p>{props.followUp.followUpAction}</p>
                <Divider />
                <Header size='small'>Diagnosis:</Header>
                <p>{props.followUp.diagnosis}</p>
                <Divider />
                <Header size='small'>Treatment:</Header>
                <p>{props.followUp.treatment}</p>
            </Segment>
        )
    } else {
        return null
    }
}

FollowUpInfo.propTypes = {
    followUp: PropTypes.object.isRequired
}

export default FollowUpInfo


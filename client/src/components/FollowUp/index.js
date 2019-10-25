import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
    Button
} from 'semantic-ui-react';

import FollowUpModal from './FollowUpModal';

export default class index extends Component {
    static propTypes = {
        prop: PropTypes
    }

    handleSubmit() {
        console.log("handlingSubmit")
    }

    render() {
        return (
            <div>
                <Button>Follow Up</Button>
                <FollowUpModal handleSubmit={this.handleSubmit} />
            </div>
        )
    }
}

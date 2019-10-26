import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
    Button
} from 'semantic-ui-react';

import FollowUpModal from './FollowUpModal';

export default class FollowUp extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false
        }

        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }
    
    static propTypes = {
        prop: PropTypes
    }

    handleOpen() {
        this.setState({
            isOpen: true
        })
    }

    handleClose() {
        this.setState({
            isOpen: false
        })
    }

    render() {
        return (
            <div>
                <Button 
                    style={{"backgroundColor" : "#84ced4"}} 
                    size="large" 
                    onClick={this.handleOpen}>
                        Assess  
                </Button>
                <FollowUpModal handleSubmit={this.handleSubmit} isOpen={this.state.isOpen} handleClose={this.handleClose}/>
            </div>
        )
    }
}

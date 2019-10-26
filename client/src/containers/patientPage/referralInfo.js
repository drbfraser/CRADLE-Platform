import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { getPrettyDate } from '../../utils';

export default class ReferralInfo extends Component {
    static propTypes = {
        referral: PropTypes.object
    }

    render() {
        if (this.props.referral) {
            let ref = this.props.referral
            return (
                <div style={{"padding" : "80px 0px"}}>
                    <Typography variant="h4" component="h4">
                        Referral Pending
                    </Typography>

                    <Typography variant="subtitle1" component="subtitle1">
                        Created {getPrettyDate(ref.dateReferred)}
                    </Typography>
                    <br/> <br/>
                    <Button style={{"backgroundColor" : "#84ced4"}} size="large">Assess</Button>
                    <FollowUp />

                </div>
            )
        } else {
            return (
                <div style={{"padding" : "80px 0px"}}>
                    <Typography variant="h4" component="h4">
                        No Referral
                    </Typography>
                </div>
            )
        }

    }
}

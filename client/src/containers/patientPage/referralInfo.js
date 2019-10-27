import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography';

import { getPrettyDate } from '../../utils';
import FollowUp from '../../components/FollowUp';
import FollowUpInfo from './followUpInfo';

export default class ReferralInfo extends Component {
    static propTypes = {
        referral: PropTypes.object
    }

    render() {
        if (this.props.referral) {
            let ref = this.props.referral
            return (
                <div>
                    <Typography variant="h4" component="h4">
                        {ref.followUp ? (
                            "Referral Assessed"
                        ) : (
                            "Referral Pending"
                        )}
                    </Typography>

                    <Typography variant="subtitle1" component="subtitle1">
                        Created {getPrettyDate(ref.dateReferred)}
                    </Typography>
                    <br/> <br/>
                    <FollowUpInfo followUp={ref.followUp}/>
                    <FollowUp followUp={ref.followUp}/>
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

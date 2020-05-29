// @ts-nocheck
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import { Icon } from 'semantic-ui-react'
import { getPrettyDateTime } from '../../../utils';
import { FollowUpModal } from './followup/modal';
import { FollowUpInfo } from './followup/info';

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
            {ref.followUp ? 'Referral Assessed' : 'Referral Pending'}
          </Typography>
          <br />
          <Typography variant="subtitle1" component="subtitle1">
            <Icon
              name="clock outline"
              size="large"
              style={{ 'line-height': '0.7em' }}
            />
            Referred on {getPrettyDateTime(ref.dateReferred)}
          </Typography>
          <br /> <br />
          <Typography variant="subtitle1" component="subtitle1">
            <Icon
              style={{ 'line-height': '0.7em' }}
              name="building outline"
              size="large"
            />
            Referred to {ref.referralHealthFacilityName}
          </Typography>
          {!ref.followUp && (
            <div style={{ padding: '10px 0' }}>
              <Typography variant="h6" component="h6">
                Comment:
              </Typography>
              <Typography variant="subtitle1" component="subtitle1">
                {ref.comment}
              </Typography>
            </div>
          )}
          <br />
          <FollowUpInfo followUp={ref.followUp} />
          <FollowUpModal
            readingId={this.props.readingId}
            referralId={ref.id}
            initialValues={ref.followUp}
          />
        </div>
      )
    } else {
      return (
        <div style={{ padding: '80px 0px' }}>
          <Typography variant="h4" component="h4">
            No Referral
          </Typography>
        </div>
      )
    }
  }
}

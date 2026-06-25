import {
  AssessmentCard,
  CustomizedFormCard,
  ReadingCard,
  ReferralAssessedCard,
  ReferralCancelledCard,
  ReferralNotAttendedCard,
  ReferralPendingCard,
} from '../cards';
import { FlattenedRecord } from 'src/shared/types/types';

export const PatientRecordCard = ({ record }: { record: FlattenedRecord }) => {
  switch (record.type) {
    case 'assessment':
      return <AssessmentCard assessment={record} />;
    case 'form':
      return <CustomizedFormCard form={record} />;
    case 'reading':
      return <ReadingCard reading={record} />;
    case 'referral':
      if (record.isAssessed) {
        return <ReferralAssessedCard referral={record} />;
      }
      if (record.isCancelled) {
        return <ReferralCancelledCard referral={record} />;
      }
      if (record.notAttended) {
        return <ReferralNotAttendedCard referral={record} />;
      }
      return <ReferralPendingCard referral={record} />;
    default:
      return <div>error</div>;
  }
};

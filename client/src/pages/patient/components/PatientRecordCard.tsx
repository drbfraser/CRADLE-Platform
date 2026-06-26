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
      return <AssessmentCard assessment={record as never} />;
    case 'form':
      return <CustomizedFormCard form={record as never} />;
    case 'reading':
      return <ReadingCard reading={record as never} />;
    case 'referral':
      if (record.isAssessed) {
        return <ReferralAssessedCard referral={record as never} />;
      }
      if (record.isCancelled) {
        return <ReferralCancelledCard referral={record as never} />;
      }
      if (record.notAttended) {
        return <ReferralNotAttendedCard referral={record as never} />;
      }
      return <ReferralPendingCard referral={record as never} />;
    default:
      return <div>error</div>;
  }
};

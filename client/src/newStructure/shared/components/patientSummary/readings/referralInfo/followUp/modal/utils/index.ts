import { followupFrequencyUnitOptions } from '../../utils';

export const initialState = {
  data: {
    diagnosis: ``,
    treatment: ``,
    specialInvestigations: ``,
    medicationPrescribed: ``,
    followupNeeded: false,
    dateFollowupNeededTill: ``,
    followupInstructions: ``,
    followupFrequencyUnit: followupFrequencyUnitOptions[0],
    followupFrequencyValue: null,
  },
  isOpen: false,
  dateOrOther: `DATE`,
  untilDateOrCond: undefined
};

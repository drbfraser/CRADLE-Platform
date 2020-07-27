import { NewReading, OrNull, UrineTests } from '@types';
import { toggleNoneSymptom, updateSelectedSymptoms } from './utils';

import { SymptomEnum } from '../../../../enums';

export enum ActionTypeEnum {
  HIDE_PROMPT,
  SHOW_PROMPT,
  CLOSE_READING_MODAL,
  OPEN_READING_MODAL,
  UPDATE_NEW_READING,
  NONE_SYMPTOM_TOGGLED,
  SYMPTOM_TOGGLED,
  UPDATE_OTHER_SYMPTOMS,
  UPDATE_URINE_TEST,
  TOGGLE_URINE_TEST,
  RESET,
}

type ShowPromptPayload = {
  message: string;
  onPromptConfirmed: () => void;
};

export type UpdateNewReadingKey =
  | `bpDiastolic`
  | `bpSystolic`
  | `heartRateBPM`
  | `isFlaggedForFollowup`
  | `urineTests`;

type UpdateNewReadingPayload = {
  key: UpdateNewReadingKey;
  value: NewReading[UpdateNewReadingKey];
};

type UpdateUrineTestPayload = { key: keyof UrineTests; value: string };

export type Action =
  | { type: ActionTypeEnum.HIDE_PROMPT }
  | {
      type: ActionTypeEnum.SHOW_PROMPT;
      payload: ShowPromptPayload;
    }
  | { type: ActionTypeEnum.CLOSE_READING_MODAL }
  | { type: ActionTypeEnum.OPEN_READING_MODAL }
  | {
      type: ActionTypeEnum.UPDATE_NEW_READING;
      payload: UpdateNewReadingPayload;
    }
  | { type: ActionTypeEnum.NONE_SYMPTOM_TOGGLED }
  | { type: ActionTypeEnum.SYMPTOM_TOGGLED; payload: { symptom: SymptomEnum } }
  | {
      type: ActionTypeEnum.UPDATE_OTHER_SYMPTOMS;
      payload: { otherSymptoms: string };
    }
  | {
      type: ActionTypeEnum.UPDATE_URINE_TEST;
      payload: UpdateUrineTestPayload;
    }
  | { type: ActionTypeEnum.TOGGLE_URINE_TEST }
  | { type: ActionTypeEnum.RESET };

type State = {
  onPromptConfirmed: OrNull<() => void>;
  promptMessage: OrNull<string>;
  displayPatientModal: boolean;
  showVitals: boolean;
  showPrompt: boolean;
  showTrafficLights: boolean;
  displayReadingModal: boolean;
  showSuccessReading: boolean;
  hasUrineTest: boolean;
  selectedSymptoms: Record<SymptomEnum, boolean>;
  otherSymptoms: string;
  newReading: NewReading;
};

export const initialState: State = {
  onPromptConfirmed: null,
  promptMessage: null,
  displayPatientModal: false,
  showVitals: true,
  showPrompt: false,
  showTrafficLights: false,
  displayReadingModal: false,
  showSuccessReading: false,
  hasUrineTest: false,
  selectedSymptoms: {
    [SymptomEnum.NONE]: true,
    [SymptomEnum.HEADACHE]: false,
    [SymptomEnum.BLEEDING]: false,
    [SymptomEnum.BLURRED_VISION]: false,
    [SymptomEnum.FEVERISH]: false,
    [SymptomEnum.ABDOMINAL_PAIN]: false,
    [SymptomEnum.UNWELL]: false,
    [SymptomEnum.OTHER]: false,
  },
  otherSymptoms: ``,
  newReading: {
    bpDiastolic: ``,
    bpSystolic: ``,
    heartRateBPM: ``,
    isFlaggedForFollowup: false,
    urineTests: {
      urineTestBlood: ``,
      urineTestGlu: ``,
      urineTestLeuc: ``,
      urineTestNit: ``,
      urineTestPro: ``,
    },
  },
};

type ActionCreatorSignature = {
  hidePrompt: () => Action;
  showPrompt: (payload: ShowPromptPayload) => Action;
  closeReadingModal: () => Action;
  openReadingModal: () => Action;
  updateNewReading: (payload: UpdateNewReadingPayload) => Action;
  updateSymptoms: (symptom: SymptomEnum) => Action;
  updateOtherSymptoms: (otherSymptoms: string) => Action;
  updateUrineTest: (payload: UpdateUrineTestPayload) => Action;
  toggleUrineTest: () => Action;
  reset: () => Action;
};

export const actionCreators: ActionCreatorSignature = {
  hidePrompt: (): Action => {
    return { type: ActionTypeEnum.HIDE_PROMPT };
  },
  showPrompt: ({ message, onPromptConfirmed }: ShowPromptPayload): Action => {
    return {
      type: ActionTypeEnum.SHOW_PROMPT,
      payload: { message, onPromptConfirmed },
    };
  },
  closeReadingModal: (): Action => {
    return { type: ActionTypeEnum.CLOSE_READING_MODAL };
  },
  openReadingModal: (): Action => {
    return { type: ActionTypeEnum.OPEN_READING_MODAL };
  },
  updateNewReading: (payload: UpdateNewReadingPayload): Action => {
    return { type: ActionTypeEnum.UPDATE_NEW_READING, payload };
  },
  updateSymptoms: (symptom: SymptomEnum): Action => {
    if (symptom === SymptomEnum.NONE) {
      return { type: ActionTypeEnum.NONE_SYMPTOM_TOGGLED };
    }

    return {
      type: ActionTypeEnum.SYMPTOM_TOGGLED,
      payload: { symptom },
    };
  },
  updateOtherSymptoms: (otherSymptoms: string): Action => {
    return {
      type: ActionTypeEnum.UPDATE_OTHER_SYMPTOMS,
      payload: { otherSymptoms },
    };
  },
  updateUrineTest: (payload: UpdateUrineTestPayload): Action => {
    return {
      type: ActionTypeEnum.UPDATE_URINE_TEST,
      payload,
    };
  },
  toggleUrineTest: (): Action => {
    return { type: ActionTypeEnum.TOGGLE_URINE_TEST };
  },
  reset: (): Action => {
    return { type: ActionTypeEnum.RESET };
  },
};

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case ActionTypeEnum.HIDE_PROMPT: {
      return { ...state, showPrompt: false };
    }
    case ActionTypeEnum.SHOW_PROMPT: {
      return {
        ...state,
        showPrompt: true,
        promptMessage: action.payload.message,
        onPromptConfirmed: action.payload.onPromptConfirmed,
      };
    }
    case ActionTypeEnum.CLOSE_READING_MODAL: {
      return { ...state, displayReadingModal: false };
    }
    case ActionTypeEnum.OPEN_READING_MODAL: {
      return { ...state, displayReadingModal: true };
    }
    case ActionTypeEnum.UPDATE_NEW_READING: {
      return {
        ...state,
        newReading: {
          ...state.newReading,
          [action.payload.key]: action.payload.value,
        },
      };
    }
    case ActionTypeEnum.NONE_SYMPTOM_TOGGLED: {
      return {
        ...state,
        selectedSymptoms: toggleNoneSymptom(
          state.selectedSymptoms[SymptomEnum.NONE]
        ),
      };
    }
    case ActionTypeEnum.SYMPTOM_TOGGLED: {
      return {
        ...state,
        selectedSymptoms: updateSelectedSymptoms(
          action.payload.symptom,
          state.selectedSymptoms
        ),
      };
    }
    case ActionTypeEnum.UPDATE_OTHER_SYMPTOMS: {
      return {
        ...state,
        otherSymptoms: action.payload.otherSymptoms,
      };
    }
    case ActionTypeEnum.UPDATE_URINE_TEST: {
      return {
        ...state,
        newReading: {
          ...state.newReading,
          urineTests: {
            ...state.newReading.urineTests,
            [action.payload.key]: action.payload.value,
          },
        },
      };
    }
    case ActionTypeEnum.TOGGLE_URINE_TEST: {
      return { ...state, hasUrineTest: !state.hasUrineTest };
    }
    case ActionTypeEnum.RESET: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};

import {
  EditedPatient,
  FollowUp,
  NewAssessment,
  NewReading,
  OrNull,
  Patient,
  UrineTests,
} from '@types';
import {
  GestationalAgeUnitEnum,
  SexEnum,
  SymptomEnum,
} from '../../../../enums';
import {
  getTimestampFromMonths,
  getTimestampFromWeeks,
} from '../../../../shared/utils';
import { toggleNoneSymptom, updateSelectedSymptoms } from './utils';

export enum ActionTypeEnum {
  HIDE_PROMPT,
  SHOW_PROMPT,
  CLOSE_READING_MODAL,
  OPEN_READING_MODAL,
  CLOSE_PATIENT_MODAL,
  OPEN_PATIENT_MODAL,
  CLOSE_ASSESSMENT_MODAL,
  OPEN_ASSESSMENT_MODAL,
  INITIALIZE_EDITED_PATIENT,
  EDIT_PATIENT_SEX,
  EDIT_IS_PREGNANT,
  EDIT_OTHER_PATIENT_FIELD,
  TOGGLE_PATIENT_GESTATIONAL_AGE_UNIT,
  EDIT_GESTATIONAL_TIMESTAMP,
  UPDATE_NEW_READING,
  NONE_SYMPTOM_TOGGLED,
  SYMPTOM_TOGGLED,
  UPDATE_OTHER_SYMPTOMS,
  UPDATE_URINE_TEST,
  TOGGLE_URINE_TEST,
  SHOW_VITALS,
  SHOW_TRAFFIC_LIGHTS,
  TOGGLE_FOLLOW_UP_NEEDED,
  UPDATE_ASSESSMENT,
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

type EditPatientKey =
  | `patientName`
  | `patientId`
  | `patientAge`
  | `patientSex`
  | `dob`
  | `isPregnant`
  | `gestationalAgeUnit`
  | `gestationalTimestamp`
  | `villageNumber`
  | `zone`
  | `drugHistory`
  | `medicalHistory`;

type EditPatientPayload = {
  name: EditPatientKey;
  value: Patient[EditPatientKey];
};

type UpdateAssessmentPayload = {
  name: keyof NewAssessment;
  value: NewAssessment[keyof NewAssessment];
};

export type Action =
  | { type: ActionTypeEnum.HIDE_PROMPT }
  | {
      type: ActionTypeEnum.SHOW_PROMPT;
      payload: ShowPromptPayload;
    }
  | { type: ActionTypeEnum.CLOSE_READING_MODAL }
  | { type: ActionTypeEnum.OPEN_READING_MODAL }
  | { type: ActionTypeEnum.CLOSE_PATIENT_MODAL }
  | { type: ActionTypeEnum.OPEN_PATIENT_MODAL }
  | { type: ActionTypeEnum.CLOSE_ASSESSMENT_MODAL }
  | {
      type: ActionTypeEnum.OPEN_ASSESSMENT_MODAL;
      payload: { followUp: OrNull<FollowUp> };
    }
  | {
      type: ActionTypeEnum.INITIALIZE_EDITED_PATIENT;
      payload: { patient: Patient };
    }
  | {
      type: ActionTypeEnum.EDIT_PATIENT_SEX;
      payload: { sex: SexEnum };
    }
  | {
      type: ActionTypeEnum.EDIT_IS_PREGNANT;
      payload: { isPregnant: boolean };
    }
  | {
      type: ActionTypeEnum.EDIT_OTHER_PATIENT_FIELD;
      payload: EditPatientPayload;
    }
  | {
      type: ActionTypeEnum.TOGGLE_PATIENT_GESTATIONAL_AGE_UNIT;
    }
  | {
      type: ActionTypeEnum.EDIT_GESTATIONAL_TIMESTAMP;
      payload: { value: string };
    }
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
  | { type: ActionTypeEnum.SHOW_VITALS }
  | { type: ActionTypeEnum.SHOW_TRAFFIC_LIGHTS }
  | { type: ActionTypeEnum.TOGGLE_FOLLOW_UP_NEEDED }
  | { type: ActionTypeEnum.UPDATE_ASSESSMENT; payload: UpdateAssessmentPayload }
  | { type: ActionTypeEnum.RESET };

type State = {
  assessment: NewAssessment;
  displayAssessmentModal: boolean;
  displayPatientModal: boolean;
  displayReadingModal: boolean;
  editedPatient: EditedPatient;
  hasUrineTest: boolean;
  newReading: NewReading;
  otherSymptoms: string;
  promptMessage: OrNull<string>;
  selectedSymptoms: Record<SymptomEnum, boolean>;
  showPrompt: boolean;
  showTrafficLights: boolean;
  showVitals: boolean;
  onPromptConfirmed: OrNull<() => void>;
};

export const initialState: State = {
  assessment: {
    diagnosis: ``,
    treatment: ``,
    specialInvestigations: ``,
    medicationPrescribed: ``,
    followupNeeded: false,
    followupInstructions: null,
  },
  displayAssessmentModal: false,
  displayPatientModal: false,
  displayReadingModal: false,
  editedPatient: {
    dob: null,
    drugHistory: ``,
    gestationalAgeUnit: GestationalAgeUnitEnum.WEEKS,
    gestationalTimestamp: Date.now(),
    isPregnant: true,
    medicalHistory: ``,
    patientAge: null,
    patientId: ``,
    patientName: ``,
    patientSex: SexEnum.FEMALE,
    villageNumber: ``,
    zone: ``,
  },
  hasUrineTest: false,
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
  otherSymptoms: ``,
  promptMessage: null,
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
  showPrompt: false,
  showTrafficLights: false,
  showVitals: true,
  onPromptConfirmed: null,
};

type ActionCreatorSignature = {
  hidePrompt: () => Action;
  showPrompt: (payload: ShowPromptPayload) => Action;
  closeReadingModal: () => Action;
  openReadingModal: () => Action;
  closePatientModal: () => Action;
  openPatientModal: () => Action;
  closeAssessmentModal: () => Action;
  openAssessmentModal: (payload: { followUp: OrNull<FollowUp> }) => Action;
  initializeEditedPatient: (patient: Patient) => Action;
  editPatient: (payload: EditPatientPayload) => Action;
  updateNewReading: (payload: UpdateNewReadingPayload) => Action;
  updateSymptoms: (symptom: SymptomEnum) => Action;
  updateOtherSymptoms: (otherSymptoms: string) => Action;
  updateUrineTest: (payload: UpdateUrineTestPayload) => Action;
  toggleUrineTest: () => Action;
  showVitals: () => Action;
  showTrafficLights: () => Action;
  updateAssessment: (payload: UpdateAssessmentPayload) => Action;
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
  closePatientModal: (): Action => {
    return { type: ActionTypeEnum.CLOSE_PATIENT_MODAL };
  },
  openPatientModal: (): Action => {
    return { type: ActionTypeEnum.OPEN_PATIENT_MODAL };
  },
  closeAssessmentModal: (): Action => {
    return { type: ActionTypeEnum.CLOSE_ASSESSMENT_MODAL };
  },
  openAssessmentModal: (payload: { followUp: OrNull<FollowUp> }): Action => {
    return { type: ActionTypeEnum.OPEN_ASSESSMENT_MODAL, payload };
  },
  initializeEditedPatient: (patient: Patient): Action => {
    return {
      type: ActionTypeEnum.INITIALIZE_EDITED_PATIENT,
      payload: { patient },
    };
  },
  editPatient: ({ name, value }: EditPatientPayload): Action => {
    if (name === `patientSex`) {
      return {
        type: ActionTypeEnum.EDIT_PATIENT_SEX,
        payload: { sex: value as SexEnum },
      };
    } else if (name === `gestationalAgeUnit`) {
      return {
        type: ActionTypeEnum.TOGGLE_PATIENT_GESTATIONAL_AGE_UNIT,
      };
    } else if (name === `gestationalTimestamp`) {
      return {
        type: ActionTypeEnum.EDIT_GESTATIONAL_TIMESTAMP,
        payload: { value: value as string },
      };
    } else if (name === `isPregnant`) {
      return {
        type: ActionTypeEnum.EDIT_IS_PREGNANT,
        payload: { isPregnant: value as boolean },
      };
    }

    return {
      type: ActionTypeEnum.EDIT_OTHER_PATIENT_FIELD,
      payload: { name, value },
    };
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
  showVitals: (): Action => {
    return { type: ActionTypeEnum.SHOW_VITALS };
  },
  showTrafficLights: (): Action => {
    return { type: ActionTypeEnum.SHOW_TRAFFIC_LIGHTS };
  },
  updateAssessment: (payload: UpdateAssessmentPayload): Action => {
    if (payload.name === `followupNeeded`) {
      return { type: ActionTypeEnum.TOGGLE_FOLLOW_UP_NEEDED };
    }

    return { type: ActionTypeEnum.UPDATE_ASSESSMENT, payload };
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
    case ActionTypeEnum.CLOSE_PATIENT_MODAL: {
      return { ...state, displayPatientModal: false };
    }
    case ActionTypeEnum.OPEN_PATIENT_MODAL: {
      return { ...state, displayPatientModal: true };
    }
    case ActionTypeEnum.CLOSE_ASSESSMENT_MODAL: {
      return { ...state, displayAssessmentModal: false };
    }
    case ActionTypeEnum.OPEN_ASSESSMENT_MODAL: {
      return {
        ...state,
        displayAssessmentModal: true,
        assessment: action.payload.followUp ?? state.assessment,
      };
    }
    case ActionTypeEnum.INITIALIZE_EDITED_PATIENT: {
      const dob = action.payload.patient.dob;
      const drugHistory = action.payload.patient.drugHistory;
      const gestationalAgeUnit = action.payload.patient.gestationalAgeUnit;
      const gestationalTimestamp = action.payload.patient.gestationalTimestamp;
      const isPregnant = action.payload.patient.isPregnant;
      const medicalHistory = action.payload.patient.medicalHistory;
      const patientAge = action.payload.patient.patientAge;
      const patientId = action.payload.patient.patientId;
      const patientName = action.payload.patient.patientName;
      const patientSex = action.payload.patient.patientSex;
      const villageNumber = action.payload.patient.villageNumber;
      const zone = action.payload.patient.zone;

      return {
        ...state,
        editedPatient: {
          dob,
          drugHistory,
          gestationalAgeUnit,
          gestationalTimestamp,
          isPregnant,
          medicalHistory,
          patientAge,
          patientId,
          patientName,
          patientSex,
          villageNumber,
          zone,
        },
      };
    }
    case ActionTypeEnum.EDIT_PATIENT_SEX: {
      return {
        ...state,
        editedPatient: {
          ...state.editedPatient,
          patientSex: action.payload.sex,
          gestationalTimestamp:
            action.payload.sex === SexEnum.MALE
              ? Date.now()
              : state.editedPatient.gestationalTimestamp,
          isPregnant:
            action.payload.sex === SexEnum.MALE
              ? false
              : state.editedPatient.isPregnant,
        },
      };
    }
    case ActionTypeEnum.EDIT_IS_PREGNANT: {
      return {
        ...state,
        editedPatient: {
          ...state.editedPatient,
          isPregnant: action.payload.isPregnant,
          gestationalAgeUnit: action.payload.isPregnant
            ? GestationalAgeUnitEnum.WEEKS
            : state.editedPatient.gestationalAgeUnit,
          gestationalTimestamp: action.payload.isPregnant
            ? Date.now() / 1000
            : state.editedPatient.gestationalTimestamp,
        },
      };
    }
    case ActionTypeEnum.EDIT_OTHER_PATIENT_FIELD: {
      return {
        ...state,
        editedPatient: {
          ...state.editedPatient,
          [action.payload.name]: action.payload.value,
        },
      };
    }
    case ActionTypeEnum.TOGGLE_PATIENT_GESTATIONAL_AGE_UNIT: {
      return {
        ...state,
        editedPatient: {
          ...state.editedPatient,
          gestationalAgeUnit:
            state.editedPatient.gestationalAgeUnit ===
            GestationalAgeUnitEnum.WEEKS
              ? GestationalAgeUnitEnum.MONTHS
              : GestationalAgeUnitEnum.WEEKS,
        },
      };
    }
    case ActionTypeEnum.EDIT_GESTATIONAL_TIMESTAMP: {
      return {
        ...state,
        editedPatient: {
          ...state.editedPatient,
          gestationalTimestamp:
            state.editedPatient.gestationalAgeUnit ===
            GestationalAgeUnitEnum.WEEKS
              ? getTimestampFromWeeks(action.payload.value)
              : getTimestampFromMonths(action.payload.value),
        },
      };
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
    case ActionTypeEnum.SHOW_VITALS: {
      return { ...state, showVitals: true, showTrafficLights: false };
    }
    case ActionTypeEnum.SHOW_TRAFFIC_LIGHTS: {
      return { ...state, showTrafficLights: true, showVitals: false };
    }
    case ActionTypeEnum.TOGGLE_FOLLOW_UP_NEEDED: {
      return {
        ...state,
        assessment: {
          ...state.assessment,
          followupNeeded: !state.assessment.followupNeeded,
          followupInstructions: state.assessment.followupNeeded ? null : ``,
        },
      };
    }
    case ActionTypeEnum.UPDATE_ASSESSMENT: {
      return {
        ...state,
        assessment: {
          ...state.assessment,
          [action.payload.name]: action.payload.value,
        },
      };
    }
    case ActionTypeEnum.RESET: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};

import { OrNull } from 'src/types';

export enum ActionTypeEnum {
  HIDE_PROMPT,
  SHOW_PROMPT,
  SHOW_VITALS,
  SHOW_TRAFFIC_LIGHTS,
}

type ShowPromptPayload = {
  message: string;
  onPromptConfirmed: () => void;
};

export type Action =
  | { type: ActionTypeEnum.HIDE_PROMPT }
  | {
      type: ActionTypeEnum.SHOW_PROMPT;
      payload: ShowPromptPayload;
    }
  | { type: ActionTypeEnum.SHOW_VITALS }
  | { type: ActionTypeEnum.SHOW_TRAFFIC_LIGHTS };

type State = {
  promptMessage: OrNull<string>;
  showPrompt: boolean;
  showTrafficLights: boolean;
  showVitals: boolean;
  onPromptConfirmed: OrNull<() => void>;
};

export const initialState: State = {
  promptMessage: null,
  showPrompt: false,
  showTrafficLights: false,
  showVitals: true,
  onPromptConfirmed: null,
};

type ActionCreatorSignature = {
  hidePrompt: () => Action;
  showPrompt: (payload: ShowPromptPayload) => Action;
  showVitals: () => Action;
  showTrafficLights: () => Action;
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
  showVitals: (): Action => {
    return { type: ActionTypeEnum.SHOW_VITALS };
  },
  showTrafficLights: (): Action => {
    return { type: ActionTypeEnum.SHOW_TRAFFIC_LIGHTS };
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
    case ActionTypeEnum.SHOW_VITALS: {
      return { ...state, showVitals: true, showTrafficLights: false };
    }
    case ActionTypeEnum.SHOW_TRAFFIC_LIGHTS: {
      return { ...state, showTrafficLights: true, showVitals: false };
    }
    default: {
      return state;
    }
  }
};

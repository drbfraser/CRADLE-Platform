import { OrNull, User, VHT } from '@types';

export enum ActionTypeEnum {
  CLOSE_EDIT_USER_MODAL,
  OPEN_EDIT_USER_MODAL,
  CLOSE_DELETE_USER_MODAL,
  OPEN_DELETE_USER_MODAL,
  INITIALIZE_USER,
  UPDATE_USER,
  UPDATE_VHT_LIST,
  RESET,
}

type InitializeUserPayload = {
  user: User;
};

type UpdateUserKey = `email` | `firstName` | `healthFacilityName` | `roleIds`;

type UpdateUserPayload = {
  name: UpdateUserKey | `vhtList`;
  value: User[UpdateUserKey] | Array<number>;
};

export type Action =
  | { type: ActionTypeEnum.CLOSE_EDIT_USER_MODAL }
  | { type: ActionTypeEnum.OPEN_EDIT_USER_MODAL }
  | { type: ActionTypeEnum.CLOSE_DELETE_USER_MODAL }
  | { type: ActionTypeEnum.OPEN_DELETE_USER_MODAL }
  | { type: ActionTypeEnum.INITIALIZE_USER; payload: InitializeUserPayload }
  | { type: ActionTypeEnum.UPDATE_USER; payload: UpdateUserPayload }
  | { type: ActionTypeEnum.RESET };

export type EditUser = Omit<User, 'vhtList'> & { vhtList: Array<number> };

type State = {
  displayEditUserModal: boolean;
  displayDeleteUserModal: boolean;
  user: OrNull<EditUser>;
};

export const initialState: State = {
  displayEditUserModal: false,
  displayDeleteUserModal: false,
  user: null,
};

type ActionCreatorSignature = {
  closeEditUserModal: () => Action;
  openEditUserModal: () => Action;
  closeDeleteUserModal: () => Action;
  openDeleteUserModal: () => Action;
  initializeUser: (payload: InitializeUserPayload) => Action;
  updateUser: (payload: UpdateUserPayload) => Action;
  reset: () => Action;
};

export const actionCreators: ActionCreatorSignature = {
  closeEditUserModal: (): Action => {
    return { type: ActionTypeEnum.CLOSE_EDIT_USER_MODAL };
  },
  openEditUserModal: (): Action => {
    return { type: ActionTypeEnum.OPEN_EDIT_USER_MODAL };
  },
  closeDeleteUserModal: (): Action => {
    return { type: ActionTypeEnum.CLOSE_DELETE_USER_MODAL };
  },
  openDeleteUserModal: (): Action => {
    return { type: ActionTypeEnum.OPEN_DELETE_USER_MODAL };
  },
  initializeUser: (payload: InitializeUserPayload): Action => {
    return { type: ActionTypeEnum.INITIALIZE_USER, payload };
  },
  updateUser: (payload: UpdateUserPayload): Action => {
    return { type: ActionTypeEnum.UPDATE_USER, payload };
  },
  reset: (): Action => {
    return { type: ActionTypeEnum.RESET };
  },
};

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case ActionTypeEnum.CLOSE_EDIT_USER_MODAL: {
      return { ...state, displayEditUserModal: false };
    }
    case ActionTypeEnum.OPEN_EDIT_USER_MODAL: {
      return { ...state, displayEditUserModal: Boolean(state.user) };
    }
    case ActionTypeEnum.CLOSE_DELETE_USER_MODAL: {
      return { ...state, displayDeleteUserModal: false };
    }
    case ActionTypeEnum.OPEN_DELETE_USER_MODAL: {
      return { ...state, displayDeleteUserModal: Boolean(state.user) };
    }
    case ActionTypeEnum.INITIALIZE_USER: {
      return {
        ...state,
        user: {
          ...action.payload.user,
          vhtList: action.payload.user.vhtList.map(({ id }: VHT): number => id),
        },
      };
    }
    case ActionTypeEnum.UPDATE_USER: {
      return {
        ...state,
        user: {
          ...(state.user as EditUser),
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

import { EditUser, OrNull, User, VHT } from '@types';

import { AutocompleteOption } from '../../../../../../../../../shared/components/input/autocomplete/utils';
import { RoleEnum } from '../../../../../../../../../enums';
import { getRoles } from '../../../../../utils';

export enum ActionTypeEnum {
  CLOSE_EDIT_USER_MODAL,
  OPEN_EDIT_USER_MODAL,
  CLOSE_DELETE_USER_MODAL,
  OPEN_DELETE_USER_MODAL,
  INITIALIZE_USER,
  UPDATE_USER,
  UPDATE_OPTIONS,
  RESET,
}

type InitializeUserPayload = {
  user: User;
};

export type UpdateUserKey = `email` | `firstName`;

type UpdateUserPayload = {
  name: UpdateUserKey;
  value: User[UpdateUserKey];
};

export type UpdateOptionsKey = `healthFacilityName` | `roleIds` | `vhtList`;

type UpdateOptionsPayload = {
  name: UpdateOptionsKey;
  value: AutocompleteOption | Array<AutocompleteOption>;
};

export type Action =
  | { type: ActionTypeEnum.CLOSE_EDIT_USER_MODAL }
  | { type: ActionTypeEnum.OPEN_EDIT_USER_MODAL }
  | { type: ActionTypeEnum.CLOSE_DELETE_USER_MODAL }
  | { type: ActionTypeEnum.OPEN_DELETE_USER_MODAL }
  | { type: ActionTypeEnum.INITIALIZE_USER; payload: InitializeUserPayload }
  | { type: ActionTypeEnum.UPDATE_USER; payload: UpdateUserPayload }
  | { type: ActionTypeEnum.UPDATE_OPTIONS; payload: UpdateOptionsPayload }
  | { type: ActionTypeEnum.RESET };

type State = {
  displayEditUserModal: boolean;
  displayDeleteUserModal: boolean;
  originalUser: OrNull<EditUser>;
  user: OrNull<EditUser>;
};

export const initialState: State = {
  displayEditUserModal: false,
  displayDeleteUserModal: false,
  originalUser: null,
  user: null,
};

type ActionCreatorSignature = {
  closeEditUserModal: () => Action;
  openEditUserModal: () => Action;
  closeDeleteUserModal: () => Action;
  openDeleteUserModal: () => Action;
  initializeUser: (payload: InitializeUserPayload) => Action;
  updateUser: (payload: UpdateUserPayload) => Action;
  updateOptions: (payload: UpdateOptionsPayload) => Action;
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
  updateOptions: (payload: UpdateOptionsPayload): Action => {
    return { type: ActionTypeEnum.UPDATE_OPTIONS, payload };
  },
  reset: (): Action => {
    return { type: ActionTypeEnum.RESET };
  },
};

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case ActionTypeEnum.CLOSE_EDIT_USER_MODAL: {
      return {
        ...state,
        displayEditUserModal: false,
      };
    }
    case ActionTypeEnum.OPEN_EDIT_USER_MODAL: {
      return {
        ...state,
        displayEditUserModal: Boolean(state.user),
        user: state.originalUser,
      };
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
        originalUser: {
          ...action.payload.user,
          healthFacilityName: {
            label: action.payload.user.healthFacilityName,
            value: action.payload.user.healthFacilityName,
          },
          roleIds: getRoles(action.payload.user.roleIds).map(
            (
              role: RoleEnum,
              index: number
            ): AutocompleteOption<RoleEnum, number> => ({
              label: role,
              value: action.payload.user.roleIds[index],
            })
          ),
          vhtList: action.payload.user.vhtList.map(
            ({ email, id }: VHT): AutocompleteOption<string, number> => ({
              label: email,
              value: id,
            })
          ),
        },
        user: {
          ...action.payload.user,
          healthFacilityName: {
            label: action.payload.user.healthFacilityName,
            value: action.payload.user.healthFacilityName,
          },
          roleIds: getRoles(action.payload.user.roleIds).map(
            (
              role: RoleEnum,
              index: number
            ): AutocompleteOption<RoleEnum, number> => ({
              label: role,
              value: action.payload.user.roleIds[index],
            })
          ),
          vhtList: action.payload.user.vhtList.map(
            ({ email, id }: VHT): AutocompleteOption<string, number> => ({
              label: email,
              value: id,
            })
          ),
        },
      };
    }
    case ActionTypeEnum.UPDATE_USER:
    case ActionTypeEnum.UPDATE_OPTIONS: {
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

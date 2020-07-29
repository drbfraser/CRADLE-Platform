import {
  Assessment,
  Callback,
  NewAssessment,
  OrNull,
  Referral,
  ServerError,
} from '@types';
import { ServerRequestAction, serverRequestActionCreator } from '../utils';

import { BASE_URL } from '../../../server/utils';
import { Dispatch } from 'redux';
import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import axios from 'axios';

enum ReferralsEnum {
  GET_REFERRALS_REQUESTED = `referrals/GET_REFERRALS_REQUESTED`,
  GET_REFERRALS_SUCCESS = `referrals/GET_REFERRALS_SUCCESS`,
  GET_REFERRALS_ERROR = `referrals/GET_REFERRALS_ERROR`,
  CREATE_ASSESSMENT_REQUESTED = `referrals/CREATE_ASSESSMENT_REQUESTED`,
  CREATE_ASSESSMENT_SUCCESS = `referrals/CREATE_ASSESSMENT_SUCCESS`,
  CREATE_ASSESSMENT_ERROR = `referrals/CREATE_ASSESSMENT_ERROR`,
  CLEAR_CREATE_ASSESSMENT_OUTCOME = `referrals/CLEAR_CREATE_ASSESSMENT_OUTCOME`,
  UPDATE_ASSESSMENT_REQUESTED = `referrals/UPDATE_ASSESSMENT_REQUESTED`,
  UPDATE_ASSESSMENT_SUCCESS = `referrals/UPDATE_ASSESSMENT_SUCCESS`,
  UPDATE_ASSESSMENT_ERROR = `referrals/UPDATE_ASSESSMENT_ERROR`,
  CLEAR_UPDATE_ASSESSMENT_OUTCOME = `referrals/CLEAR_UPDATE_ASSESSMENT_OUTCOME`,
}

type FollowUpSuccessPayload = {
  readingId: string;
  followUp: Assessment;
};

type ErrorPayload = {
  error: string;
};

type ReferralsAction =
  | { type: ReferralsEnum.GET_REFERRALS_REQUESTED }
  | {
      type: ReferralsEnum.GET_REFERRALS_SUCCESS;
      payload: { mappedReferrals: Record<string, Referral> };
    }
  | {
      type: ReferralsEnum.GET_REFERRALS_ERROR;
      payload: ErrorPayload;
    }
  | { type: ReferralsEnum.CREATE_ASSESSMENT_REQUESTED }
  | {
      type: ReferralsEnum.CREATE_ASSESSMENT_SUCCESS;
      payload: FollowUpSuccessPayload;
    }
  | { type: ReferralsEnum.CREATE_ASSESSMENT_ERROR; payload: ErrorPayload }
  | { type: ReferralsEnum.CLEAR_CREATE_ASSESSMENT_OUTCOME }
  | { type: ReferralsEnum.UPDATE_ASSESSMENT_REQUESTED }
  | {
      type: ReferralsEnum.UPDATE_ASSESSMENT_SUCCESS;
      payload: FollowUpSuccessPayload;
    }
  | { type: ReferralsEnum.UPDATE_ASSESSMENT_ERROR; payload: ErrorPayload }
  | { type: ReferralsEnum.CLEAR_UPDATE_ASSESSMENT_OUTCOME };

const getReferralsRequested = () => ({
  type: ReferralsEnum.GET_REFERRALS_REQUESTED,
});

export const getReferrals = (
  referralIds: Array<number>
): ((dispatch: Dispatch) => void) => {
  return (dispatch: Dispatch): void => {
    dispatch(getReferralsRequested());

    const referralPromises = referralIds.map(
      (referralId: number): Promise<{ data: any }> => {
        return axios.get(`${BASE_URL}${Endpoints.REFERRAL}/${referralId}`);
      }
    );

    Promise.all(referralPromises)
      .then((results: Array<{ data: Referral }>) => {
        dispatch({
          type: ReferralsEnum.GET_REFERRALS_SUCCESS,
          payload: {
            mappedReferrals: results.reduce(
              (
                referrals: Record<string, Referral>,
                result: { data: Referral }
              ): Record<string, any> => {
                referrals[result.data.readingId] = result.data;
                return referrals;
              },
              {}
            ),
          },
        });
      })
      .catch(
        (error: {
          response?: { data: { message: string }; status: number };
        }) => {
          console.error(error);
          dispatch({
            type: ReferralsEnum.GET_REFERRALS_ERROR,
            payload: {
              error:
                error.response?.data.message ??
                `Something went wrong on our end which means you can't perform this action right now. We are working hard at getting it fixed soon!`,
            },
          });
        }
      );
  };
};

const createAssessmentRequested = (): ReferralsAction => ({
  type: ReferralsEnum.CREATE_ASSESSMENT_REQUESTED,
});

export const createAssessment = (
  readingId: string,
  data: NewAssessment
): Callback<Dispatch, ServerRequestAction> => {
  return (dispatch: Dispatch): ServerRequestAction => {
    dispatch(createAssessmentRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: Endpoints.FOLLOW_UP,
        method: Methods.POST,
        data,
        onSuccess: (response: Assessment): ReferralsAction => ({
          type: ReferralsEnum.CREATE_ASSESSMENT_SUCCESS,
          payload: { readingId, followUp: response },
        }),
        onError: ({ message }: ServerError): ReferralsAction => ({
          type: ReferralsEnum.CREATE_ASSESSMENT_ERROR,
          payload: { error: message },
        }),
      })
    );
  };
};

export const clearCreateAssessmentOutcome = (): ReferralsAction => ({
  type: ReferralsEnum.CLEAR_CREATE_ASSESSMENT_OUTCOME,
});

const updateAssessmentRequested = (): ReferralsAction => ({
  type: ReferralsEnum.UPDATE_ASSESSMENT_REQUESTED,
});

export const updateAssessment = (
  readingId: string,
  referralId: string,
  data: NewAssessment
): Callback<Dispatch, ServerRequestAction> => {
  return (dispatch: Dispatch) => {
    dispatch(updateAssessmentRequested());

    return dispatch(
      serverRequestActionCreator({
        endpoint: `${Endpoints.FOLLOW_UP}/${referralId}`,
        method: Methods.PUT,
        data,
        onSuccess: (response: Assessment): ReferralsAction => ({
          type: ReferralsEnum.UPDATE_ASSESSMENT_SUCCESS,
          payload: { readingId, followUp: response },
        }),
        onError: ({ message }: ServerError): ReferralsAction => ({
          type: ReferralsEnum.UPDATE_ASSESSMENT_ERROR,
          payload: { error: message },
        }),
      })
    );
  };
};

export const clearUpdateAssessmentOutcome = (): ReferralsAction => ({
  type: ReferralsEnum.CLEAR_UPDATE_ASSESSMENT_OUTCOME,
});

export type ReferralsState = {
  error: OrNull<string>;
  success: OrNull<string>;
  loading: boolean;
  mappedReferrals: OrNull<Record<string, Referral>>;
};

const initialState: ReferralsState = {
  error: null,
  success: null,
  loading: false,
  mappedReferrals: null,
};

export const referralsReducer = (
  state = initialState,
  action: ReferralsAction
): ReferralsState => {
  switch (action.type) {
    case ReferralsEnum.GET_REFERRALS_REQUESTED:
    case ReferralsEnum.CREATE_ASSESSMENT_REQUESTED:
    case ReferralsEnum.UPDATE_ASSESSMENT_REQUESTED:
      return {
        ...initialState,
        loading: true,
      };
    case ReferralsEnum.GET_REFERRALS_SUCCESS:
      return {
        ...state,
        mappedReferrals: action.payload.mappedReferrals,
        loading: false,
      };
    case ReferralsEnum.CREATE_ASSESSMENT_SUCCESS:
      return {
        ...state,
        success: `Assessment created successfuly!`,
        mappedReferrals: {
          ...state.mappedReferrals,
          [action.payload.readingId]: {
            ...(state.mappedReferrals?.[action.payload.readingId] as Referral),
            followUp: action.payload.followUp,
          },
        },
        loading: false,
      };
    case ReferralsEnum.UPDATE_ASSESSMENT_SUCCESS:
      return {
        ...state,
        success: `Assessment updated successfuly!`,
        mappedReferrals: {
          ...state.mappedReferrals,
          [action.payload.readingId]: {
            ...(state.mappedReferrals?.[action.payload.readingId] as Referral),
            followUp: action.payload.followUp,
          },
        },
        loading: false,
      };
    case ReferralsEnum.GET_REFERRALS_ERROR:
      return {
        ...state,
        error: action.payload.error,
        loading: false,
      };
    case ReferralsEnum.CREATE_ASSESSMENT_ERROR:
    case ReferralsEnum.UPDATE_ASSESSMENT_ERROR:
      return {
        ...state,
        error: action.payload.error,
        loading: false,
      };
    case ReferralsEnum.CLEAR_CREATE_ASSESSMENT_OUTCOME:
      return {
        ...state,
        error: null,
        success: null,
      };
    case ReferralsEnum.CLEAR_UPDATE_ASSESSMENT_OUTCOME:
      return {
        ...state,
        error: null,
        success: null,
      };
    default:
      return state;
  }
};

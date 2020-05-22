import { BASE_URL } from '../../../server/utils';
import { Endpoints } from '../../../server/endpoints';
import { Methods } from '../../../server/methods';
import axios from 'axios';
import { serverRequestActionCreator } from '../utils';

const GET_REFERRALS_REQUESTED = `referrals/GET_REFERRALS_REQUESTED`;
const GET_REFERRALS = `referrals/GET_REFERRALS`;
const GET_REFERRALS_ERROR = `referrals/GET_REFERRALS_ERROR`;

const GET_REFERRAL_REQUESTED = `referrals/GET_REFERRAL_REQUESTED`;
const GET_REFERRAL = `referrals/GET_REFERRAL`;
const GET_REFERRAL_ERROR = `referrals/GET_REFERRAL_ERROR`;

const UPDATE_FOLLOW_UP_REQUESTED = `referrals/UPDATE_FOLLOW_UP_REQUESTED`;
const UPDATE_FOLLOW_UP_SUCCESS = `referrals/UPDATE_FOLLOW_UP_SUCCESS`;
const UPDATE_FOLLOW_UP_ERROR = `referrals/UPDATE_FOLLOW_UP_ERROR`;

const SET_READING_ID = `referrals/SET_READING_ID`;

export const getReferral = (referralId: any) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.REFERRAL}/${referralId}`,
    onSuccess: (response: any) => ({
      type: GET_REFERRAL,
      payload: response,
    }),
    onError: (error: any) => ({
      type: GET_REFERRAL_ERROR,
      payload: error,
    }),
  });
};

// TODO: create Endpoints /referral to get all referrals for user
export const getReferrals = (referralIds: any) => (dispatch: any) => {
  dispatch({
    type: GET_REFERRALS_REQUESTED,
  });

  let referralPromises = [];
  for (let i in referralIds) {
    let referralId = referralIds[i];
    referralPromises.push(axios.get(BASE_URL + `/referral/${referralId}`));
  }

  Promise.all(referralPromises)
    .then((results: any) => {
      let referrals = {} as { [key: string]: any};
      for (let i in results) {
        let thisReferral = results[i].data;
        referrals[thisReferral.readingId] = thisReferral;
      }

      dispatch({
        type: GET_REFERRALS,
        payload: referrals,
      });
    })
    .catch((err: any) => {
      console.error(err);
      dispatch({
        type: GET_REFERRALS_ERROR,
      });
    });
};

const updateFollowUpOnSuccess = (response: any) => ({
  type: UPDATE_FOLLOW_UP_SUCCESS,
  payload: response,
});

const updateFollowUpOnError = (error: any) => ({
  type: UPDATE_FOLLOW_UP_ERROR,
  payload: error,
});

export const updateFollowUp = (followUpId: any, data: any) => {
  return serverRequestActionCreator({
    endpoint: `${Endpoints.FOLLOW_UP}/${followUpId}`,
    method: Methods.PUT,
    data,
    onSuccess: updateFollowUpOnSuccess,
    onError: updateFollowUpOnError,
  });
};

export const createFollowUp = (data: any) => {
  return serverRequestActionCreator({
    endpoint: Endpoints.FOLLOW_UP,
    method: Methods.POST,
    data,
    onSuccess: updateFollowUpOnSuccess,
    onError: updateFollowUpOnError,
  });
};

export const setReadingId = (readingId: any) => {
  return (dispatch: any) => {
    console.log('setting reading id');
    return dispatch({
      type: SET_READING_ID,
      payload: readingId,
    });
  };
};

const initialState = {
  mappedReferrals: {} as { [key: string]: any }, // maps reading id to referral objects
  referralId: null,
  readingId: null,
};

export const referralsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case GET_REFERRAL:
      return {
        ...state,
        referral: action.payload,
        isLoading: false,
      };

    case GET_REFERRALS:
      return {
        ...state,
        mappedReferrals: action.payload,
        isLoading: false,
      };

    case UPDATE_FOLLOW_UP_SUCCESS:
      return {
        ...state,
        mappedReferrals: {
          ...state.mappedReferrals,
          [state.readingId ?? ``]: {
            ...state.mappedReferrals[state.readingId ?? ``],
            followUp: action.payload.data,
          },
        },
        isLoading: false,
      };

    case GET_REFERRAL_REQUESTED:
    case GET_REFERRALS_REQUESTED:
    case UPDATE_FOLLOW_UP_REQUESTED:
      return {
        ...state,
        isLoading: true,
      };

    case GET_REFERRAL_ERROR:
    case GET_REFERRALS_ERROR:
    case UPDATE_FOLLOW_UP_ERROR:
      return {
        ...state,
        isLoading: false,
      };

    case SET_READING_ID:
      return {
        ...state,
        readingId: action.payload,
      };

    default:
      return state;
  }
};

import { isValidNumber } from 'libphonenumber-js';
import { User } from 'src/shared/api/validation/user';

export const getOtherUsers = (users: User[], thisUsersId: number) => {
  return users.filter((user) => user.id != thisUsersId);
};

export const getEmails = (users: User[]) => {
  return users.map((user) => user.email);
};

/**
 * Returns a flattened list of all phone numbers belonging to the users in the
 * `users` array
 * */
export const getPhoneNumbers = (users: User[]) => {
  return users.flatMap((user) => user.phoneNumbers);
};

export const getOtherUsersEmailsAndPhoneNumbers = (
  users: User[],
  thisUsersId: number
) => {
  const otherUsers = getOtherUsers(users, thisUsersId);

  return {
    otherUsersEmails: getEmails(otherUsers),
    otherUsersPhoneNumbers: getPhoneNumbers(otherUsers),
  };
};

export const validateUserPhoneNumber = (
  phoneNumber: string,
  thisUsersPhoneNumbers: string[],
  otherUsersPhoneNumbers: string[]
) => {
  if (!isValidNumber(phoneNumber)) {
    return 'Invalid Phone Number';
  }

  // Check if phone number is already in use by this user.
  const thisUserOccurrences = thisUsersPhoneNumbers.filter((value) => {
    return value == phoneNumber;
  }).length;

  // Check if phone number is already in use by other users.
  const otherUserOccurrences = otherUsersPhoneNumbers.filter((value) => {
    return value == phoneNumber;
  }).length;

  if (thisUserOccurrences > 1 || otherUserOccurrences > 0) {
    return 'Phone Number Already In Use';
  }

  return undefined;
};

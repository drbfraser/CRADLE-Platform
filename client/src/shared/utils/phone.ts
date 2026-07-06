import parsePhoneNumberFromString from 'libphonenumber-js';

export const formatPhoneNumber = (phoneNumber: string) => {
  const formattedPhoneNumber =
    parsePhoneNumberFromString(phoneNumber)?.formatInternational();
  return formattedPhoneNumber ?? phoneNumber;
};

export const formatPhoneNumbers = (phoneNumbers: string[]) => {
  return phoneNumbers.map(formatPhoneNumber);
};

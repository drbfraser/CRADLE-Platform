import * as Yup from 'yup';

export enum RelayNumField {
  phone = 'phone',
  description = 'description',
  lastReceived = 'lastReceived',
}

export const RelayNumTemplate = {
  phone: '',
  description: '',
  lastReceived: 0,
};

export const getValidationSchema = (existingNums: string[]) => {
  return Yup.object().shape({
    [RelayNumField.phone]: Yup.string()
      .label('Phone Number')
      .max(50)
      .required()
      .test(
        'existing-num',
        'You may not create a relay app server with the same number as an existing one.',
        (value) => {
          const format = (value: any) => String(value).toLowerCase().trim();
          return !existingNums.map((n) => format(n)).includes(format(value));
        }
      ),
    [RelayNumField.description]: Yup.string().max(50),
  });
};

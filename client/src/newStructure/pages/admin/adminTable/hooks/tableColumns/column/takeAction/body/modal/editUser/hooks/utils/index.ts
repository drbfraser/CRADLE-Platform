import { IUseVHTOptions } from '../vhtOptions';

export const getAllVhtEmails = (
  vhtIds: Array<number>,
  vhtOptions: Array<IUseVHTOptions>
): Array<string> => {
  return vhtOptions
    .filter((option: IUseVHTOptions): boolean => {
      return vhtIds.includes(option.value);
    })
    .map(({ text }: IUseVHTOptions): string => text);
};

import { getLanguages } from 'src/shared/utils';

/** Convert language code to language name */
export const getLanguageName = (langCode: any): string => {
  const language: string =
    new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode) ||
    'English';
  return language;
};

/** Check if returned browser language name is part of built in languages */
export const getDefaultLanguage = () => {
  const browserLanguage: string = getLanguageName(
    navigator.language || window.navigator.language
  );
  const languageOptions = getLanguages();
  let defaultLang = languageOptions[0];
  languageOptions.forEach((languageOption) => {
    const language = languageOption === undefined ? '' : languageOption;
    if (browserLanguage.includes(language)) {
      defaultLang = language;
    }
  });
  return defaultLang;
};

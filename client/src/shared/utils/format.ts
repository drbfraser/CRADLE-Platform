import ISO6391 from 'iso-639-1';

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getLanguages = (): (string | undefined)[] => {
  return ISO6391.getAllNames();
};

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

export const capitalize = (word: string) => {
  if (!word) return word;
  return word[0].toUpperCase() + word.substr(1).toLowerCase();
};

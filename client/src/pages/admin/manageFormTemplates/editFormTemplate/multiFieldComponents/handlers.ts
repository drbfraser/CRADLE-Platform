import { Dispatch, SetStateAction } from 'react';
import { McOption, QuestionLangVersion } from 'src/shared/types';

export const handleAddChoice = (
  numChoices: number,
  inputLanguages: string[],
  setNumChoices: React.Dispatch<React.SetStateAction<any>>,
  questionLangVersions: QuestionLangVersion[],
  setQuestionLangversions: Dispatch<SetStateAction<QuestionLangVersion[]>>
) => {
  const newNumChoices = numChoices + 1;
  inputLanguages.map((lang) => {
    handleMultiChoiceOptionChange(
      lang,
      '',
      numChoices,
      questionLangVersions,
      setQuestionLangversions
    );
  });
  setNumChoices(newNumChoices);
};

export const handleRemoveMultiChoice = (
  index: number,
  numChoices: number,
  questionLangVersions: any,
  inputLanguages: string[],
  setNumChoices: React.Dispatch<React.SetStateAction<any>>,
  setQuestionLangversions: any
) => {
  const qLangVersions: QuestionLangVersion[] = questionLangVersions;

  inputLanguages.forEach((lang) => {
    const qLangVersion = qLangVersions.find((qlv) => qlv.lang == lang);
    if (qLangVersion) {
      const i = qLangVersions.indexOf(qLangVersion);
      if (i >= 0) {
        // remove option
        qLangVersions[i].mcOptions.splice(index, 1);

        // reset indices for options
        qLangVersions[i].mcOptions.forEach((mcOption, mci) => {
          mcOption.mcid = mci;
        });
      }
    }
  });

  const newNumChoices = numChoices - 1;
  setNumChoices(newNumChoices);
  setQuestionLangversions(qLangVersions);
};

export const handleMultiChoiceOptionChange = (
  language: string,
  option: string,
  index: number,
  /*Added for helper*/
  questionLangVersions: QuestionLangVersion[],
  setQuestionLangversions: Dispatch<SetStateAction<QuestionLangVersion[]>>
) => {
  const qLangVersions: QuestionLangVersion[] = questionLangVersions;

  const newQLangVersion = {
    lang: language,
    mcOptions: [] as McOption[],
    questionText: '',
  };

  const qLangVersion = qLangVersions.find((q) => q.lang === language);

  if (!qLangVersion) {
    newQLangVersion.mcOptions.push({
      mcid: index,
      opt: option,
    });
    qLangVersions.push(newQLangVersion);
  } else {
    const i = qLangVersions.indexOf(qLangVersion);
    if (index < qLangVersions[i].mcOptions.length) {
      qLangVersions[i].mcOptions[index].opt = option;
    } else {
      qLangVersions[i].mcOptions.push({
        mcid: index,
        opt: option,
      });
    }
  }
  setQuestionLangversions(qLangVersions);
};

export const handleRadioChange = (
  event: {
    target: { value: SetStateAction<string> };
  },
  setFieldType: React.Dispatch<React.SetStateAction<any>>,
  setFieldChanged: React.Dispatch<React.SetStateAction<any>>,
  setFormDirty: React.Dispatch<React.SetStateAction<any>>,
  fieldChanged: boolean
) => {
  setFieldType(event.target.value);
  setFieldChanged(!fieldChanged);
  setFormDirty(true);
};

export const handleVisibilityChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setEnableVisiblity: React.Dispatch<React.SetStateAction<any>>,
  setFormDirty: React.Dispatch<React.SetStateAction<any>>,
  setFieldChanged: React.Dispatch<React.SetStateAction<any>>,
  fieldChanged: boolean
) => {
  setEnableVisiblity(event.target.checked);
  setFormDirty(true);
  setFieldChanged(!fieldChanged);
};

export const handleRequiredChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setIsRequired: React.Dispatch<React.SetStateAction<any>>,
  setFormDirty: React.Dispatch<React.SetStateAction<any>>,
  setFieldChanged: React.Dispatch<React.SetStateAction<any>>,
  fieldChanged: boolean
) => {
  setIsRequired(event.target.checked);
  setFormDirty(true);
  setFieldChanged(!fieldChanged);
};

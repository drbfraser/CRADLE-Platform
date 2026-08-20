import {
  FormTemplateWithQuestionsV2,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import {
  useEffect,
  useReducer,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import { useMediaQuery } from '@mui/material';
import { QuestionTypeEnum } from 'src/shared/enums';
import { capitalize } from 'src/shared/utils';
import { useFormQuestionMutations } from './useFormQuestionMutations';

export const useCustomizedFormWQuestions = (
  fm: FormTemplateWithQuestionsV2,
  languages: string[],
  versionError: boolean,
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestionsV2>>,
  setCurrentLanguage: Dispatch<SetStateAction<string>>
) => {
  const questions = fm.questions;
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [submitError, setSubmitError] = useState(false);
  const [visibilityToggle, setVisibilityToggle] = useState(false);
  const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [categoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categoryIndex, setCategoryIndex] = useState<number | null>(null);

  const {
    handleCatUp,
    handleCatDown,
    handleFieldUp,
    handleFieldDown,
    handleDeleteOnClose,
    handleDeleteField,
  } = useFormQuestionMutations({
    questions,
    setForm,
    setSelectedOrder,
    setIsDeletePopupOpen,
    setCategoryIndex,
    selectedOrder,
    forceUpdate,
  });

  const getInputLanguages = (question: TQuestion) => {
    return Object.keys(question.questionText);
  };

  const isMobile = useMediaQuery('(max-width:599px)');

  useEffect(() => {
    updateAddedQuestions(languages);
    setSelectedLanguage(capitalize(languages[0]));
    forceUpdate();
  }, [languages]);

  useEffect(() => {
    setCurrentLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const updateAddedQuestions = (langs: string[]) => {
    const classificationName = fm.classification?.name || {};
    langs.forEach((language) => {
      const langKey = language.toLowerCase();
      if (!classificationName[langKey]) {
        classificationName[langKey] = '';
      }
    });

    Object.keys(classificationName).forEach((lang) => {
      if (!langs.map((l) => l.toLowerCase()).includes(lang.toLowerCase())) {
        delete classificationName[lang];
      }
    });

    setForm((prev) => ({
      ...prev,
      classification: {
        ...prev.classification,
        name: classificationName,
      },
    }));

    questions.forEach((question) => {
      const currentLanguages = Object.keys(question.questionText);

      for (const lang of currentLanguages) {
        if (!langs.map((l) => l.toLowerCase()).includes(lang.toLowerCase())) {
          delete question.questionText[lang];
        }
      }

      langs.forEach((language) => {
        if (!currentLanguages.includes(language.toLowerCase())) {
          question.questionText[language.toLowerCase()] = '';
        }
      });
    });
  };

  const handleEditField = (question: TQuestion) => {
    setSelectedOrder(question.order);
    if (question.questionType == QuestionTypeEnum.CATEGORY) {
      setCategoryIndex(question.categoryIndex);
      setCategoryPopupOpen(true);
    } else {
      setVisibilityToggle(
        selectedOrder != null &&
          fm.questions[selectedOrder]?.visibleCondition.length > 0
      );
      setEditPopupOpen(true);
    }
  };

  const getEmptyLanguages = (question: TQuestion) => {
    const emptyLangs = Object.entries(question.questionText)
      .filter(([_, text]) => text?.trim() === '')
      .map(([lang]) => lang);

    return emptyLangs.join(', ');
  };

  const missingFields = (question: TQuestion): boolean => {
    const emptyLanguageArray = getEmptyLanguages(question).split(', ');
    return emptyLanguageArray.length !== 0 && emptyLanguageArray[0] !== '';
  };

  const emptyLanguageFieldsInForm = (): boolean => {
    let emptyLangs = false;

    const classificationName = fm.classification?.name || {};
    const missingClassificationLangs = languages.some((lang) => {
      const text = classificationName[lang.toLowerCase()];
      return !text || text.trim() === '';
    });

    if (missingClassificationLangs) {
      emptyLangs = true;
    }

    questions.forEach((q) => {
      emptyLangs = emptyLangs || missingFields(q);
    });

    return emptyLangs;
  };

  const disabled =
    !(fm?.questions?.length > 0) || emptyLanguageFieldsInForm() || versionError;

  return {
    selectedLanguage,
    submitError,
    setSubmitError,
    visibilityToggle,
    isSubmitPopupOpen,
    errorMessage,
    categoryPopupOpen,
    setCategoryPopupOpen,
    setSelectedOrder,
    categoryIndex,
    questions,
    selectedOrder,
    getInputLanguages,
    editPopupOpen,
    setEditPopupOpen,
    setVisibilityToggle,
    isDeletePopupOpen,
    handleDeleteOnClose,
    setSelectedLanguage,
    isMobile,
    setErrorMessage,
    setCategoryIndex,
    handleCatUp,
    handleFieldUp,
    handleEditField,
    handleCatDown,
    handleFieldDown,
    handleDeleteField,
    missingFields,
    getEmptyLanguages,
    setIsSubmitPopupOpen,
    disabled,
  };
};

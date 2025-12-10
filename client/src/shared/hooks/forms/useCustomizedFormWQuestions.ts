import {
  FormTemplateWithQuestions,
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

export const useCustomizedFormWQuestions = (
  fm: FormTemplateWithQuestions,
  languages: string[],
  versionError: boolean,
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestions>>,
  setCurrentLanguage: Dispatch<SetStateAction<string>>
) => {
  const questions = fm.questions;
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [submitError, setSubmitError] = useState(false);
  const [visibilityToggle, setVisibilityToggle] = useState(false);
  const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [, upd] = useReducer((x) => x + 1, 0);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [categoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categoryIndex, setCategoryIndex] = useState<number | null>(null);

  const getInputLanguages = (question: TQuestion) => {
    return Object.keys(question.questionText);
  };

  const isMobile = useMediaQuery('(max-width:599px)');

  useEffect(() => {
    updateAddedQuestions(languages);
    setSelectedLanguage(capitalize(languages[0]));
    upd();
  }, [languages]);

  useEffect(() => {
    setCurrentLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const updateAddedQuestions = (languages: string[]) => {
    // Update classification name translations
    const classificationName = fm.classification?.name || {};
    languages.forEach((language) => {
      const langKey = language.toLowerCase();
      if (!classificationName[langKey]) {
        classificationName[langKey] = '';
      }
    });

    // Remove languages from classification
    Object.keys(classificationName).forEach((lang) => {
      if (!languages.map((l) => l.toLowerCase()).includes(lang.toLowerCase())) {
        delete classificationName[lang];
      }
    });

    // Update form with new classification name
    setForm((prev) => ({
      ...prev,
      classification: {
        ...prev.classification,
        name: classificationName,
      },
    }));

    // Update question translations
    questions.forEach((question) => {
      const currentLanguages = Object.keys(question.questionText);

      // Remove languages
      for (const lang of currentLanguages) {
        if (
          !languages.map((l) => l.toLowerCase()).includes(lang.toLowerCase())
        ) {
          delete question.questionText[lang];
        }
      }

      // Add missing languages
      languages.forEach((language) => {
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

  const handleDeleteOnClose = (confirmed: boolean) => {
    if (selectedOrder !== null && confirmed) {
      // User clicked OK
      const questionsToDelete = questions.filter(
        (q) => q.categoryIndex === selectedOrder || q.order === selectedOrder
      );
      questionsToDelete.forEach(deleteField);
    }
    setIsDeletePopupOpen(false);
    setSelectedOrder(null);
  };

  const handleDeleteField = (question: TQuestion) => {
    setSelectedOrder(question.order);
    setCategoryIndex(null);
    if (question.questionType == QuestionTypeEnum.CATEGORY) {
      setIsDeletePopupOpen(true);
    } else {
      deleteField(question);
    }
  };

  const handleCatUp = (cat: TQuestion) => {
    if (cat.order === 0) {
      return;
    }
    const prevCatIndex = questions[cat.order - 1].categoryIndex;
    let prevCatQs: TQuestion[] = [];
    // edge case: prev cat has no qs
    if (prevCatIndex !== null) {
      prevCatQs = questions.filter(
        (q) => q.order == prevCatIndex || q.categoryIndex == prevCatIndex
      );
    } else {
      prevCatQs.push(questions[cat.order - 1]);
    }
    const catQs = questions.filter(
      (q) => q.order == cat.order || q.categoryIndex == cat.order
    );
    moveCat(prevCatQs, catQs);
  };

  const handleCatDown = (cat: TQuestion) => {
    const catQs = questions.filter(
      (q) => q.order == cat.order || q.categoryIndex == cat.order
    );
    const nextCatIndex = catQs[catQs.length - 1].order + 1;
    if (nextCatIndex >= questions.length) {
      return;
    }
    const nextCatQs = questions.filter(
      (q) => q.order == nextCatIndex || q.categoryIndex == nextCatIndex
    );
    moveCat(catQs, nextCatQs);
  };

  // switches position of 2 categories of questions
  const moveCat = (prevCatQs: TQuestion[], catQs: TQuestion[]) => {
    let insertionIndex = prevCatQs[0].order;
    prevCatQs.forEach((q) => {
      updateVisCond(q.order, q.order + catQs.length);
      q.order += catQs.length;
      if (q.categoryIndex !== null) {
        q.categoryIndex += catQs.length;
      }
    });
    catQs.forEach((q) => {
      const oldIndex = q.order;
      updateVisCond(q.order, q.order - prevCatQs.length);
      q.order -= prevCatQs.length;
      if (q.categoryIndex !== null) {
        q.categoryIndex -= prevCatQs.length;
      }
      questions.splice(insertionIndex++, 0, q);
      questions.splice(oldIndex + 1, 1);
    });
    upd();
  };

  const handleFieldUp = (question: TQuestion) => {
    setSelectedOrder(question.order);
    moveField(question, true);
  };

  const handleFieldDown = (question: TQuestion) => {
    setSelectedOrder(question.order);
    moveField(question, false);
  };

  const deleteField = (question: TQuestion) => {
    const index = question.order;
    questions.splice(index, 1);

    // reset indices
    questions.forEach((q, i) => {
      if (
        q.visibleCondition &&
        q.visibleCondition[0] &&
        q.visibleCondition[0].questionIndex == index
      ) {
        q.visibleCondition = [];
      }
      if (q.categoryIndex && q.categoryIndex > index) {
        q.categoryIndex -= 1;
      }
      updateVisCond(q.order, i);
      q.order = i;
    });

    // update form
    if (setForm) {
      setForm((form) => {
        form.questions = questions;
        return form;
      });
    }
    setSelectedOrder(null);
    upd();
  };

  const moveField = (question: any, up: boolean) => {
    const index = question.order;
    if (
      up &&
      index > 0 &&
      question.categoryIndex < index - 1 &&
      question.questionType != QuestionTypeEnum.CATEGORY
    ) {
      const temp = questions[index - 1];
      questions[index - 1] = questions[index];
      questions[index] = temp;
      questions[index].order = index;
      questions[index - 1].order = index - 1;
      updateVisCond(index - 1, index);
      updateVisCond(index, index - 1);
      upd();
    } else if (!up && question.order < questions.length - 1) {
      moveField(questions[index + 1], true);
    }
  };

  // check if any questions in form have a vis cond dependant on a question whos index changed
  const updateVisCond = (oldIndex: number, newIndex: number) => {
    questions.forEach((q) => {
      if (
        q.visibleCondition &&
        q.visibleCondition[0]?.questionIndex == oldIndex
      ) {
        q.visibleCondition[0].questionIndex = newIndex;
      }
    });
  };

  const getEmptyLanguages = (question: TQuestion) => {
    const emptyLangs = Object.entries(question.questionText)
      .filter(([_, text]) => text.trim() === '')
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

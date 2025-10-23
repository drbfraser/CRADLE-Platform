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

export const useCustomizedFormWQuestions = (
  fm: FormTemplateWithQuestions,
  languages: string[],
  versionError: boolean,
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestions>>
) => {
  const questions = fm.questions;
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [submitError, setSubmitError] = useState(false);
  const [visibilityToggle, setVisibilityToggle] = useState(false);
  const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [, upd] = useReducer((x) => x + 1, 0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [categoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categoryIndex, setCategoryIndex] = useState<number | null>(null);
  const getInputLanguages = (question: TQuestion) => {
    return question.langVersions.map((item) => item.lang);
  };

  const isMobile = useMediaQuery('(max-width:599px)');

  useEffect(() => {
    updateAddedQuestions(languages);
    setSelectedLanguage(languages[0]);
    upd();
  }, [languages]);

  const updateAddedQuestions = (languages: string[]) => {
    questions.forEach((question) => {
      const currentLanguages = question.langVersions.map(
        (version) => version.lang
      );

      // if language is removed
      question.langVersions = question.langVersions.filter((v) =>
        languages.includes(v.lang)
      );

      languages.forEach((language) => {
        // if language is added
        if (!currentLanguages.includes(language)) {
          question.langVersions.push({
            lang: language,
            mcOptions: [],
            questionText: '',
          });
        }
      });
    });
  };

  const handleEditField = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    if (question.questionType == QuestionTypeEnum.CATEGORY) {
      setCategoryIndex(question.categoryIndex);
      setCategoryPopupOpen(true);
    } else {
      setVisibilityToggle(
        selectedQuestionIndex != null &&
          fm.questions[selectedQuestionIndex]?.visibleCondition.length > 0
      );
      setEditPopupOpen(true);
    }
  };

  const handleDeleteOnClose = (confirmed: boolean) => {
    if (selectedQuestionIndex !== null && confirmed) {
      // User clicked OK
      const questionsToDelete = questions.filter(
        (q) =>
          q.categoryIndex === selectedQuestionIndex ||
          q.questionIndex === selectedQuestionIndex
      );
      questionsToDelete.forEach(deleteField);
    }
    setIsDeletePopupOpen(false);
    setSelectedQuestionIndex(null);
  };

  const handleDeleteField = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    setCategoryIndex(null);
    if (question.questionType == QuestionTypeEnum.CATEGORY) {
      setIsDeletePopupOpen(true);
    } else {
      deleteField(question);
    }
  };

  const handleCatUp = (cat: TQuestion) => {
    if (cat.questionIndex === 0) {
      return;
    }
    const prevCatIndex = questions[cat.questionIndex - 1].categoryIndex;
    let prevCatQs: TQuestion[] = [];
    // edge case: prev cat has no qs
    if (prevCatIndex !== null) {
      prevCatQs = questions.filter(
        (q) =>
          q.questionIndex == prevCatIndex || q.categoryIndex == prevCatIndex
      );
    } else {
      prevCatQs.push(questions[cat.questionIndex - 1]);
    }
    const catQs = questions.filter(
      (q) =>
        q.questionIndex == cat.questionIndex ||
        q.categoryIndex == cat.questionIndex
    );
    moveCat(prevCatQs, catQs);
  };

  const handleCatDown = (cat: TQuestion) => {
    const catQs = questions.filter(
      (q) =>
        q.questionIndex == cat.questionIndex ||
        q.categoryIndex == cat.questionIndex
    );
    const nextCatIndex = catQs[catQs.length - 1].questionIndex + 1;
    if (nextCatIndex >= questions.length) {
      return;
    }
    const nextCatQs = questions.filter(
      (q) => q.questionIndex == nextCatIndex || q.categoryIndex == nextCatIndex
    );
    moveCat(catQs, nextCatQs);
  };

  // switches position of 2 categories of questions
  const moveCat = (prevCatQs: TQuestion[], catQs: TQuestion[]) => {
    let insertionIndex = prevCatQs[0].questionIndex;
    prevCatQs.forEach((q) => {
      updateVisCond(q.questionIndex, q.questionIndex + catQs.length);
      q.questionIndex += catQs.length;
      if (q.categoryIndex !== null) {
        q.categoryIndex += catQs.length;
      }
    });
    catQs.forEach((q) => {
      const oldIndex = q.questionIndex;
      updateVisCond(q.questionIndex, q.questionIndex - prevCatQs.length);
      q.questionIndex -= prevCatQs.length;
      if (q.categoryIndex !== null) {
        q.categoryIndex -= prevCatQs.length;
      }
      questions.splice(insertionIndex++, 0, q);
      questions.splice(oldIndex + 1, 1);
    });
    upd();
  };

  const handleFieldUp = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    moveField(question, true);
  };

  const handleFieldDown = (question: TQuestion) => {
    setSelectedQuestionIndex(question.questionIndex);
    moveField(question, false);
  };

  const deleteField = (question: TQuestion) => {
    const index = question.questionIndex;
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
      updateVisCond(q.questionIndex, i);
      q.questionIndex = i;
    });

    // update form
    if (setForm) {
      setForm((form) => {
        form.questions = questions;
        return form;
      });
    }
    setSelectedQuestionIndex(null);
    upd();
  };

  const moveField = (question: any, up: boolean) => {
    const index = question.questionIndex;
    if (
      up &&
      index > 0 &&
      question.categoryIndex < index - 1 &&
      question.questionType != QuestionTypeEnum.CATEGORY
    ) {
      const temp = questions[index - 1];
      questions[index - 1] = questions[index];
      questions[index] = temp;
      questions[index].questionIndex = index;
      questions[index - 1].questionIndex = index - 1;
      updateVisCond(index - 1, index);
      updateVisCond(index, index - 1);
      upd();
    } else if (!up && question.questionIndex < questions.length - 1) {
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
    const emptyLangs = question.langVersions
      .filter((qlv) => qlv.questionText === '')
      .map((qlv) => qlv.lang);

    return emptyLangs.join(', ');
  };

  const missingFields = (question: TQuestion): boolean => {
    const emptyLanguageArray = getEmptyLanguages(question).split(', ');
    return emptyLanguageArray.length !== 0 && emptyLanguageArray[0] !== '';
  };

  const emptyLanguageFieldsInForm = (): boolean => {
    let emptyLangs = false;
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
    setSelectedQuestionIndex,
    categoryIndex,
    questions,
    selectedQuestionIndex,
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

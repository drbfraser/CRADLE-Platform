import { Dispatch, SetStateAction } from 'react';
import {
  FormTemplateWithQuestionsV2,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import { QuestionTypeEnum } from 'src/shared/enums';

type UseFormQuestionMutationsOptions = {
  questions: TQuestion[];
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestionsV2>>;
  setSelectedOrder: Dispatch<SetStateAction<number | null>>;
  setIsDeletePopupOpen: Dispatch<SetStateAction<boolean>>;
  setCategoryIndex: Dispatch<SetStateAction<null | number>>;
  selectedOrder: number | null;
  forceUpdate: () => void;
};

export const useFormQuestionMutations = ({
  questions,
  setForm,
  setSelectedOrder,
  setIsDeletePopupOpen,
  setCategoryIndex,
  selectedOrder,
  forceUpdate,
}: UseFormQuestionMutationsOptions) => {
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

  const deleteField = (question: TQuestion) => {
    const index = question.order;
    questions.splice(index, 1);

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

    setForm((form) => {
      form.questions = questions;
      return form;
    });
    setSelectedOrder(null);
    forceUpdate();
  };

  const moveField = (question: TQuestion, up: boolean) => {
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
      forceUpdate();
    } else if (!up && question.order < questions.length - 1) {
      moveField(questions[index + 1], true);
    }
  };

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
    forceUpdate();
  };

  const handleCatUp = (cat: TQuestion) => {
    if (cat.order === 0) {
      return;
    }
    const prevCatIndex = questions[cat.order - 1].categoryIndex;
    let prevCatQs: TQuestion[] = [];
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

  const handleFieldUp = (question: TQuestion) => {
    setSelectedOrder(question.order);
    moveField(question, true);
  };

  const handleFieldDown = (question: TQuestion) => {
    setSelectedOrder(question.order);
    moveField(question, false);
  };

  const handleDeleteOnClose = (confirmed: boolean) => {
    if (selectedOrder !== null && confirmed) {
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

  return {
    handleCatUp,
    handleCatDown,
    handleFieldUp,
    handleFieldDown,
    handleDeleteOnClose,
    handleDeleteField,
  };
};

import { QCondition } from 'src/shared/types/form/formTypes';
import {
  FormTemplateWithQuestionsV2,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import { QuestionTypeEnum } from 'src/shared/enums';

type SaveCategoryParams = {
  form: FormTemplateWithQuestionsV2;
  question?: TQuestion;
  questionText: Record<string, string>;
  enableVisibility: boolean;
  visibleCondition: QCondition[];
  categoryIndex: number | null;
};

export const applyCategorySave = ({
  form,
  question,
  questionText,
  enableVisibility,
  visibleCondition,
  categoryIndex,
}: SaveCategoryParams): FormTemplateWithQuestionsV2 => {
  if (question && !enableVisibility) {
    question.visibleCondition.length = 0;
  }

  if (question) {
    const questionToUpdate = form.questions.find(
      (q) => q.order === question.order
    );
    if (questionToUpdate) {
      questionToUpdate.questionText = questionText;
      questionToUpdate.visibleCondition = enableVisibility
        ? visibleCondition
        : [];

      const visCondsToUpdate: TQuestion[] = [];
      form.questions.forEach((q) => {
        if (q.categoryIndex === null) return;
        if (q.categoryIndex === questionToUpdate.order) {
          visCondsToUpdate.push(q);
          return;
        }
        let rootCatIndex: number | null = q.categoryIndex;
        while (
          rootCatIndex !== null &&
          form.questions[rootCatIndex] !== undefined &&
          form.questions[rootCatIndex].categoryIndex !== null
        ) {
          if (q.categoryIndex === questionToUpdate.order) {
            visCondsToUpdate.push(q);
            return;
          }
          rootCatIndex = form.questions[rootCatIndex]?.categoryIndex ?? null;
        }
        if (rootCatIndex === questionToUpdate.order) {
          visCondsToUpdate.push(q);
        }
      });
      visCondsToUpdate.forEach((q) => {
        form.questions[q.order].visibleCondition = enableVisibility
          ? visibleCondition
          : [];
      });
    }
  } else {
    form.questions.push({
      order: form.questions.length,
      questionText: questionText,
      questionType: QuestionTypeEnum.CATEGORY,
      required: false,
      allowFutureDates: true,
      allowPastDates: true,
      numMin: null,
      numMax: null,
      stringMaxLength: null,
      units: null,
      visibleCondition: visibleCondition,
      categoryIndex: categoryIndex,
      id: undefined,
      hasCommentAttached: false,
      questionStringId: undefined,
      userQuestionId: undefined,
    });
  }

  form.questions = [...form.questions];
  return form;
};

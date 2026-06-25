import { AnswerTypeEnum } from 'src/shared/enums';
import { QAnswer } from 'src/shared/types/form/formTypes';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';

type FormAnswer = {
  answerType: AnswerTypeEnum;
  val: unknown;
};

export const mapVisibilityAnswer = (
  answer: FormAnswer,
  selectedQuestion: TQuestion
): QAnswer | undefined => {
  switch (answer.answerType) {
    case AnswerTypeEnum.TEXT:
      return { text: answer.val as string };
    case AnswerTypeEnum.NUM:
      return { number: answer.val as number };
    case AnswerTypeEnum.MC_ID_ARRAY: {
      if (!selectedQuestion.mcOptions) {
        return undefined;
      }
      const matchingOptionIndex = selectedQuestion.mcOptions.findIndex((opt) =>
        Object.values(opt.translations || {}).some(
          (translation) => translation === answer.val
        )
      );
      if (matchingOptionIndex !== -1) {
        return { mcIdArray: [matchingOptionIndex] };
      }
      return undefined;
    }
    default:
      return undefined;
  }
};

import { Dispatch, SetStateAction } from 'react';
import {
  FormTemplateWithQuestionsV2,
  TQuestion,
} from 'src/shared/types/form/formTemplateTypes';
import { FieldTypeEntry } from '../fieldTypeRegistry';
import { EditFieldHook } from './types';

interface SaveFieldParams {
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestionsV2>>;
  hook: EditFieldHook;
  question: TQuestion | undefined;
  categoryIndex: number | null;
  visibilityToggle: boolean;
  selectedFieldType: FieldTypeEntry;
}

export const applyFieldSave = ({
  setForm,
  hook,
  question,
  categoryIndex,
  visibilityToggle,
  selectedFieldType,
}: SaveFieldParams) => {
  setForm((form) => {
    let finalStringMaxLines = null;
    const stringMaxLinesInt = Number(hook.stringMaxLines);
    if (!isNaN(stringMaxLinesInt) && stringMaxLinesInt > 0) {
      finalStringMaxLines = stringMaxLinesInt;
    }

    const finalMcOptions =
      hook.fieldType === 'mult_choice' || hook.fieldType === 'mult_select'
        ? hook.mcOptions
        : [];

    if (question) {
      const questionToUpdate = form.questions.find(
        (q) => q.order === question.order
      );
      if (questionToUpdate) {
        questionToUpdate.id = hook.questionId;
        questionToUpdate.questionText = hook.questionText;
        questionToUpdate.questionType = selectedFieldType.type;
        questionToUpdate.visibleCondition = visibilityToggle
          ? hook.visibleCondition
          : [];
        questionToUpdate.required = hook.isRequired;
        questionToUpdate.allowFutureDates = hook.allowFutureDates;
        questionToUpdate.allowPastDates = hook.allowPastDates;
        questionToUpdate.stringMaxLines = finalStringMaxLines;
        questionToUpdate.numMin = hook.numMin;
        questionToUpdate.numMax = hook.numMax;
        questionToUpdate.mcOptions = finalMcOptions;
        questionToUpdate.userQuestionId = hook.userQuestionId;
        if (hook.questionTextChanged) {
          questionToUpdate.questionStringId = undefined;
        }
      }
    } else {
      let indexToInsert = form.questions.length;
      if (categoryIndex != null) {
        for (let i = categoryIndex + 1; i < form.questions.length; i++) {
          if (form.questions[i].categoryIndex != categoryIndex) {
            indexToInsert = i;
            break;
          }
        }
      }
      form.questions.splice(indexToInsert, 0, {
        order: indexToInsert,
        questionText: hook.questionText,
        questionType: selectedFieldType.type,
        required: hook.isRequired,
        allowFutureDates: hook.allowFutureDates,
        allowPastDates: hook.allowPastDates,
        numMin: hook.numMin,
        numMax: hook.numMax,
        stringMaxLength: null,
        stringMaxLines: finalStringMaxLines,
        units: null,
        visibleCondition: visibilityToggle ? hook.visibleCondition : [],
        categoryIndex: hook.categoryIndex,
        id: hook.questionId,
        mcOptions: finalMcOptions,
      } as TQuestion);
      form.questions.forEach((q, index) => {
        if (q.categoryIndex && q.categoryIndex >= indexToInsert) {
          q.categoryIndex += 1;
        }
        q.order = index;
      });
    }

    hook.setVisibleCondition([]);
    hook.setFormDirty(false);

    return {
      ...form,
      questions: [...form.questions],
    };
  });
};

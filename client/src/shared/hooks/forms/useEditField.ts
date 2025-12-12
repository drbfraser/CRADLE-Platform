import { useState, useEffect, Dispatch, SetStateAction, useMemo } from 'react';
import {
  TQuestion,
  FormTemplateWithQuestions,
} from 'src/shared/types/form/formTemplateTypes';
import { QCondition, McOption } from 'src/shared/types/form/formTypes';
import { QuestionTypeEnum } from 'src/shared/enums';

interface FieldTypes {
  [key: string]: {
    value: string;
    label: string;
    type: QuestionTypeEnum;
    render: () => JSX.Element;
  };
}

interface UseEditFieldProps {
  question: TQuestion | undefined;
  visibilityToggle: boolean;
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestions>> | undefined;
  fieldTypes: FieldTypes;
  open: boolean;
  setVisibilityToggle: Dispatch<SetStateAction<boolean>>;
  categoryIndex: number | null;
  questionsArr: TQuestion[];
  inputLanguages: string[];
}

export const useEditField = ({
  question,
  visibilityToggle,
  setForm,
  fieldTypes,
  open,
  setVisibilityToggle,
  categoryIndex,
  questionsArr,
  inputLanguages,
}: UseEditFieldProps) => {
  const [fieldType, setFieldType] = useState('category');
  const [userQuestionId, setUserQuestionId] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [numChoices, setNumChoices] = useState(0);

  // Store as object with language keys
  const [questionText, setQuestionText] = useState<Record<string, string>>(
    () => {
      if (question?.questionText && typeof question.questionText === 'object') {
        return question.questionText as Record<string, string>;
      }
      return {};
    }
  );

  const [mcOptions, setMcOptions] = useState<McOption[]>(
    question?.mcOptions ?? []
  );

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [visibleCondition, setVisibleCondition] = useState<QCondition[]>([]);
  const [fieldChanged, setFieldChanged] = useState(false);
  const [formDirty, setFormDirty] = useState(false);

  const [isRequired, setIsRequired] = useState(question?.required ?? false);
  const [allowPastDates, setAllowPastDates] = useState(
    question?.allowPastDates ?? true
  );
  const [allowFutureDates, setAllowFutureDates] = useState(
    question?.allowFutureDates ?? true
  );

  const [isVisCondAnswered, setIsVisCondAnswered] = useState(!visibilityToggle);
  const [editVisCondKey, setEditVisCondKey] = useState(0);

  const [stringMaxLines, setStringMaxLines] = useState<number | string | null>(
    question?.stringMaxLines ?? null
  );
  const [isNumOfLinesRestricted, setIsNumOfLinesRestricted] = useState(
    Boolean(question?.stringMaxLines)
  );

  const [numMin, setNumMin] = useState<number | null>(question?.numMin ?? null);
  const [numMax, setNumMax] = useState<number | null>(question?.numMax ?? null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Track if question text has changed
  const [questionTextChanged, setQuestionTextChanged] = useState(false);

  const removeAllMultChoices = () => setMcOptions([]);

  // Create questionTextMap for compatibility
  const questionTextMap = useMemo(() => questionText, [questionText]);

  const areAllFieldsFilled = useMemo(() => {
    // all languages must have non-empty string
    return inputLanguages.every((lang) => {
      const v = questionTextMap[lang.toLowerCase()];
      return typeof v === 'string' && v.trim().length > 0;
    });
  }, [inputLanguages, questionTextMap]);

  const getMcOptionValue = (language: string, index: number) => {
    const option = mcOptions[index];
    if (!option) return '';
    return option.translations?.[language.toLowerCase()] ?? '';
  };

  const validateNumberFields = (
    newMin: number | null,
    newMax: number | null
  ) => {
    if (newMin !== null && newMax !== null && newMin > newMax) {
      setValidationError(`Minimum value cannot be greater than maximum value.`);
      return;
    }
    setValidationError(null);
  };

  const getFieldType = (qt: QuestionTypeEnum) =>
    Object.keys(fieldTypes).find((ft) => fieldTypes[ft].type === qt) || '';

  // Reset numeric validation errors when modal reopens
  useEffect(() => {
    if (open) setValidationError(null);
  }, [open]);

  useEffect(() => {
    if (open && question) {
      setUserQuestionId(question.userQuestionId ?? '');
    }
  }, [open, question]);

  useEffect(() => {
    setIsVisCondAnswered(!visibilityToggle);
    setFieldChanged((prev) => !prev);
  }, [visibilityToggle]);

  // Rehydrate visible conditions when opening the edit modal
  useEffect(() => {
    if (categoryIndex !== null && questionsArr[categoryIndex]) {
      setVisibleCondition(questionsArr[categoryIndex].visibleCondition ?? []);
    } else {
      setVisibleCondition([]);
    }
    setEditVisCondKey((k) => k + 1);
  }, [open, categoryIndex, questionsArr]);

  // Main hydration effect
  useEffect(() => {
    if (formDirty) {
      return; // edits override hydration
    }

    if (question) {
      // Editing
      setFieldType(getFieldType(question.questionType));
      setQuestionId(question.id ?? '');

      setVisibilityToggle(
        visibilityToggle || (question.visibleCondition?.length ?? 0) > 0
      );

      // Convert questionText to object format
      if (question.questionText && typeof question.questionText === 'object') {
        setQuestionText(question.questionText as Record<string, string>);
      }

      setMcOptions(question.mcOptions ?? []);
      setNumChoices(question.mcOptions?.length ?? 0);

      setIsRequired(question.required ?? false);
      setAllowFutureDates(question.allowFutureDates ?? true);
      setAllowPastDates(question.allowPastDates ?? true);

      setStringMaxLines(question.stringMaxLines ?? null);
      setIsNumOfLinesRestricted(Boolean(question.stringMaxLines));

      setNumMin(question.numMin ?? null);
      setNumMax(question.numMax ?? null);
    } else {
      // Creating
      setFieldType('category');
      setQuestionId('');
      setQuestionText({});
      setMcOptions([]);
      setNumChoices(0);

      setIsRequired(false);
      setAllowFutureDates(true);
      setAllowPastDates(true);

      setIsNumOfLinesRestricted(false);
      setStringMaxLines(null);

      setNumMin(null);
      setNumMax(null);

      // Reset question text changed flag
      setQuestionTextChanged(false);
    }
  }, [open, fieldChanged]);

  // Separate effect to update save button state based on field completion
  useEffect(() => {
    setIsSaveDisabled(!areAllFieldsFilled);
  }, [areAllFieldsFilled]);

  // Get text for a specific language
  const getFieldName = (language: string) => {
    return questionText[language.toLowerCase()] ?? '';
  };

  const addFieldToQuestionLangVersions = (
    language: string,
    fieldName: string
  ) => {
    setQuestionText((prev) => ({
      ...prev,
      [language.toLowerCase()]: fieldName,
    }));
    // Mark that question text has been modified
    setQuestionTextChanged(true);
  };

  // Update mcOption for a specific language
  const updateMcOption = (index: number, language: string, value: string) => {
    setMcOptions((prev) => {
      const updated = [...prev];
      if (!updated[index]) {
        updated[index] = { translations: {} };
      }
      if (!updated[index].translations) {
        updated[index].translations = {};
      }
      updated[index].translations[language.toLowerCase()] = value;
      return updated;
    });
  };

  return {
    getFieldName,
    addFieldToQuestionLangVersions,
    setFieldChanged,
    fieldChanged,
    setFormDirty,
    fieldType,
    setQuestionId,
    setFieldType,
    editVisCondKey,
    visibleCondition,
    setVisibleCondition,
    setIsVisCondAnswered,
    isRequired,
    setIsRequired,
    allowPastDates,
    setAllowPastDates,
    allowFutureDates,
    setAllowFutureDates,
    setNumChoices,
    isSaveDisabled,
    validationError,
    removeAllMultChoices,
    stringMaxLines,
    questionId,
    numMin,
    numMax,
    questionText,
    mcOptions,
    categoryIndex,
    setNumMin,
    setNumMax,
    validateNumberFields,
    isNumOfLinesRestricted,
    setIsNumOfLinesRestricted,
    setStringMaxLines,
    numChoices,
    setQuestionText,
    setMcOptions,
    getMcOptionValue,
    updateMcOption,
    areAllFieldsFilled,
    questionTextChanged,
    userQuestionId,
    setUserQuestionId,
  };
};

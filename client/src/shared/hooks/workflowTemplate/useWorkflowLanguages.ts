import { useCallback, useEffect, useState } from 'react';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';
import {
  MultiLangText,
  WorkflowTemplateMultiLang,
} from 'src/shared/types/workflow/workflowMultiLangTypes';
import { getDefaultLanguage, getLanguages } from 'src/shared/utils/format';

export interface StepTranslations {
  name: MultiLangText;
  description: MultiLangText;
}

export interface TranslationsBag {
  classificationName: MultiLangText;
  templateDescription: MultiLangText;
  steps: Record<string, StepTranslations>;
}

const emptyBag = (): TranslationsBag => ({
  classificationName: {},
  templateDescription: {},
  steps: {},
});

// The backend's global @app.after_request camelize() hook lowercases every
// nested JSON dict key on the way out - including MultiLangText translation
// keys like "English"/"French", which have nothing to do with camelCase
// field naming. It only touches responses, not what we send, and the write
// routes capitalize whatever casing they receive regardless. So every
// MultiLangText dict we read from or write to the backend is treated as
// lowercase-keyed here (mirrors the same workaround forms' editor uses),
// while `languages`/`selectedLanguage` - the UI-facing state driving
// checkboxes and the language dropdown - stay in display casing so they
// compare correctly against getLanguages()'s options.
const bagKey = (lang: string): string => lang.trim().toLowerCase();

const lowercaseKeys = (bag: MultiLangText): MultiLangText =>
  Object.fromEntries(
    Object.entries(bag).map(([lang, text]) => [bagKey(lang), text])
  );

// Case-insensitive lookup against the canonical ISO language name list, so a
// lowercase key coming back from the backend (or any other casing) maps back
// to the properly-cased display name the language picker/dropdown expect.
const toDisplayLanguage = (lang: string): string =>
  getLanguages().find(
    (option) => option !== undefined && bagKey(option) === bagKey(lang)
  ) ?? lang;

const normalizeLanguages = (rawLanguages: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  rawLanguages.forEach((lang) => {
    const display = toDisplayLanguage(lang);
    const key = bagKey(display);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(display);
    }
  });
  return result;
};

// Case/whitespace-insensitive lookup, mirrors the backend's get_english_text -
// the write routes require an English entry regardless of how it's cased.
export const hasEnglishText = (bag: MultiLangText): boolean =>
  Object.entries(bag).some(
    ([lang, text]) => bagKey(lang) === 'english' && text?.trim()
  );

// Prunes a MultiLangText down to only the currently-checked languages - used
// when building the Save payload, per the session-safe language removal design.
// Always returns lowercase keys - the backend capitalizes them on write.
export const pruneToLanguages = (
  bag: MultiLangText,
  languages: string[]
): MultiLangText => {
  const result: MultiLangText = {};
  languages.forEach((lang) => {
    const key = bagKey(lang);
    if (bag[key] !== undefined) result[key] = bag[key];
  });
  return result;
};

export const getPrunedStepTranslations = (
  translations: TranslationsBag,
  stepId: string,
  languages: string[]
): { name: MultiLangText; description: MultiLangText } => {
  const stepTranslations = translations.steps[stepId] ?? {
    name: {},
    description: {},
  };
  return {
    name: pruneToLanguages(stepTranslations.name, languages),
    description: pruneToLanguages(stepTranslations.description, languages),
  };
};

const resolveWorkflowAtLanguage = (
  multiLang: WorkflowTemplateMultiLang,
  lang: string
): WorkflowTemplate => {
  const key = bagKey(lang);
  const name = multiLang.classification?.name[key] ?? '';
  return {
    id: multiLang.id,
    name,
    description: multiLang.description[key] ?? '',
    version: multiLang.version,
    classificationId: multiLang.classificationId,
    classification: multiLang.classification
      ? { id: multiLang.classification.id ?? '', name }
      : undefined,
    steps: multiLang.steps.map((step) => ({
      id: step.id,
      name: step.name[key] ?? '',
      description: step.description[key] ?? '',
      formId: step.formId,
      expectedCompletion: step.expectedCompletion,
      branches: step.branches,
      lastEdited: step.lastEdited,
      workflowTemplateId: step.workflowTemplateId,
    })),
    startingStepId: multiLang.startingStepId,
    archived: multiLang.archived,
    hasBranchingIssues: multiLang.hasBranchingIssues,
    dateCreated: multiLang.dateCreated,
    lastEdited: multiLang.lastEdited,
    lastEditedBy: multiLang.lastEditedBy,
  };
};

export interface UseWorkflowLanguagesOptions {
  editedWorkflow: WorkflowTemplate | null;
  setEditedWorkflow: React.Dispatch<
    React.SetStateAction<WorkflowTemplate | null>
  >;
  handleFieldChange: (field: keyof WorkflowTemplate, value: unknown) => void;
  handleStepChange: (stepId: string, field: string, value: string) => void;
}

// Owns the multi-language "translations bag" that sits alongside the plain-string
// editedWorkflow - see Phase 6.1 of the workflow-lang plan for why these are kept
// separate rather than turning editedWorkflow's fields into MultiLangText.
export const useWorkflowLanguages = ({
  editedWorkflow,
  setEditedWorkflow,
  handleFieldChange,
  handleStepChange,
}: UseWorkflowLanguagesOptions) => {
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguageState] = useState<string>('');
  const [translations, setTranslations] = useState<TranslationsBag>(emptyBag());

  // Every selected language always has a (possibly empty) slot in the bag.
  // Never deletes a language's text here - unchecking a language only removes it
  // from `languages`, the bag keeps the text until Save prunes it.
  useEffect(() => {
    if (languages.length === 0) return;

    setTranslations((prev) => {
      let changed = false;
      const classificationName = { ...prev.classificationName };
      const templateDescription = { ...prev.templateDescription };

      languages.forEach((lang) => {
        const key = bagKey(lang);
        if (!(key in classificationName)) {
          classificationName[key] = '';
          changed = true;
        }
        if (!(key in templateDescription)) {
          templateDescription[key] = '';
          changed = true;
        }
      });

      const steps = { ...prev.steps };
      Object.keys(steps).forEach((stepId) => {
        const step = steps[stepId];
        const name = { ...step.name };
        const description = { ...step.description };
        let stepChanged = false;

        languages.forEach((lang) => {
          const key = bagKey(lang);
          if (!(key in name)) {
            name[key] = '';
            stepChanged = true;
          }
          if (!(key in description)) {
            description[key] = '';
            stepChanged = true;
          }
        });

        if (stepChanged) {
          steps[stepId] = { name, description };
          changed = true;
        }
      });

      if (!changed) return prev;
      return { classificationName, templateDescription, steps };
    });
  }, [languages]);

  // Seeds the bag for steps that don't have an entry yet (e.g. just inserted via
  // handleInsertNode/handleInsertNodeBetween) - useWorkflowStepMutations stays
  // completely unaware of languages.
  const stepIdsKey = editedWorkflow?.steps.map((s) => s.id).join(',') ?? '';
  useEffect(() => {
    if (!editedWorkflow) return;

    setTranslations((prev) => {
      let changed = false;
      const steps = { ...prev.steps };

      editedWorkflow.steps.forEach((step) => {
        if (steps[step.id]) return;

        const name: MultiLangText = {};
        const description: MultiLangText = {};
        languages.forEach((lang) => {
          const key = bagKey(lang);
          name[key] = lang === selectedLanguage ? step.name : '';
          description[key] = lang === selectedLanguage ? step.description : '';
        });

        steps[step.id] = { name, description };
        changed = true;
      });

      if (!changed) return prev;
      return { ...prev, steps };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdsKey]);

  const handleTranslatedFieldChange = useCallback(
    (field: 'name' | 'description', value: string) => {
      if (!selectedLanguage) return;
      const key = bagKey(selectedLanguage);

      setTranslations((prev) => {
        if (field === 'name') {
          return {
            ...prev,
            classificationName: { ...prev.classificationName, [key]: value },
          };
        }
        return {
          ...prev,
          templateDescription: { ...prev.templateDescription, [key]: value },
        };
      });

      handleFieldChange(field, value);
    },
    [selectedLanguage, handleFieldChange]
  );

  const handleTranslatedStepFieldChange = useCallback(
    (stepId: string, field: 'name' | 'description', value: string) => {
      if (!selectedLanguage) return;
      const key = bagKey(selectedLanguage);

      setTranslations((prev) => {
        const existing = prev.steps[stepId] ?? { name: {}, description: {} };
        return {
          ...prev,
          steps: {
            ...prev.steps,
            [stepId]: {
              ...existing,
              [field]: { ...existing[field], [key]: value },
            },
          },
        };
      });

      handleStepChange(stepId, field, value);
    },
    [selectedLanguage, handleStepChange]
  );

  // Display swap only - reads the bag at `lang` into editedWorkflow's plain
  // strings, does not touch hasChanges.
  const setSelectedLanguage = useCallback(
    (lang: string) => {
      setSelectedLanguageState(lang);
      const key = bagKey(lang);

      setEditedWorkflow((prev) => {
        if (!prev) return prev;

        const name = translations.classificationName[key] ?? '';
        const description = translations.templateDescription[key] ?? '';
        const steps = prev.steps.map((step) => {
          const stepTranslations = translations.steps[step.id];
          if (!stepTranslations) return step;
          return {
            ...step,
            name: stepTranslations.name[key] ?? '',
            description: stepTranslations.description[key] ?? '',
          };
        });

        return {
          ...prev,
          name,
          description,
          classification: prev.classification
            ? { ...prev.classification, name }
            : prev.classification,
          steps,
        };
      });
    },
    [translations, setEditedWorkflow]
  );

  useEffect(() => {
    if (!selectedLanguage) return;
    if (languages.some((lang) => bagKey(lang) === bagKey(selectedLanguage)))
      return;
    setSelectedLanguage(languages[0] ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages, selectedLanguage]);

  // Create-flow entry point: sets languages/selectedLanguage directly (no
  // editedWorkflow mutation) so the two effects above seed the bag *from* the
  // already-initialized editedWorkflow's defaults, instead of overwriting them
  // with an empty bag the way setSelectedLanguage's view-swap would.
  const initializeCreateLanguages = useCallback(
    (initialLanguages: string[]) => {
      const languages = normalizeLanguages(initialLanguages);
      setLanguages(languages);
      setSelectedLanguageState(languages[0] ?? '');
    },
    []
  );

  // Sibling to useWorkflowEditor's initializeEditor - seeds the bag from a fetched
  // multi-lang payload and returns the plain-string WorkflowTemplate resolved at a
  // sensible starting language, for the caller to pass into initializeEditor.
  // `availableLanguagesRaw` comes straight off the backend response, so it may be
  // lowercased by the camelize middleware - normalizeLanguages maps it back to
  // display casing before it becomes UI-facing state.
  const initializeEditorLanguages = useCallback(
    (
      multiLang: WorkflowTemplateMultiLang,
      availableLanguagesRaw: string[]
    ): WorkflowTemplate => {
      const languages = normalizeLanguages(availableLanguagesRaw);
      const browserLanguage = getDefaultLanguage();
      const startingLanguage =
        browserLanguage &&
        languages.some((lang) => bagKey(lang) === bagKey(browserLanguage))
          ? browserLanguage
          : (languages[0] ?? '');

      const steps: TranslationsBag['steps'] = {};
      multiLang.steps.forEach((step) => {
        steps[step.id] = {
          name: lowercaseKeys(step.name),
          description: lowercaseKeys(step.description),
        };
      });

      setTranslations({
        classificationName: lowercaseKeys(multiLang.classification?.name ?? {}),
        templateDescription: lowercaseKeys(multiLang.description),
        steps,
      });
      setLanguages(languages);
      setSelectedLanguageState(startingLanguage);

      return resolveWorkflowAtLanguage(multiLang, startingLanguage);
    },
    []
  );

  const missingRequiredTranslations = useCallback((): string[] => {
    const missing: string[] = [];

    languages.forEach((lang) => {
      const key = bagKey(lang);
      if (!translations.classificationName[key]?.trim()) {
        missing.push(`Template name (${lang})`);
      }
      (editedWorkflow?.steps ?? []).forEach((step) => {
        const stepBag = translations.steps[step.id];
        if (!stepBag?.name[key]?.trim()) {
          missing.push(`${step.name || 'Step'} name (${lang})`);
        }
      });
    });

    return missing;
  }, [languages, translations, editedWorkflow]);

  const missingOptionalTranslations = useCallback((): string[] => {
    const missing: string[] = [];

    languages.forEach((lang) => {
      const key = bagKey(lang);
      if (!translations.templateDescription[key]?.trim()) {
        missing.push(`Template description (${lang})`);
      }
      (editedWorkflow?.steps ?? []).forEach((step) => {
        const stepBag = translations.steps[step.id];
        if (!stepBag?.description[key]?.trim()) {
          missing.push(`${step.name || 'Step'} description (${lang})`);
        }
      });
    });

    return missing;
  }, [languages, translations, editedWorkflow]);

  // Languages that were unchecked mid-session but still have real text sitting in
  // the bag - drives the persistent "won't be included unless re-enabled" note.
  const uncheckedLanguagesWithText = useCallback((): string[] => {
    const allLangKeys = new Set<string>([
      ...Object.keys(translations.classificationName),
      ...Object.keys(translations.templateDescription),
      ...Object.values(translations.steps).flatMap((step) => [
        ...Object.keys(step.name),
        ...Object.keys(step.description),
      ]),
    ]);
    const checkedKeys = new Set(languages.map(bagKey));

    const result: string[] = [];
    allLangKeys.forEach((key) => {
      if (checkedKeys.has(key)) return;

      const hasText =
        !!translations.classificationName[key]?.trim() ||
        !!translations.templateDescription[key]?.trim() ||
        Object.values(translations.steps).some(
          (step) => step.name[key]?.trim() || step.description[key]?.trim()
        );

      if (hasText) result.push(toDisplayLanguage(key));
    });

    return result;
  }, [translations, languages]);

  return {
    languages,
    setLanguages,
    selectedLanguage,
    setSelectedLanguage,
    translations,
    handleTranslatedFieldChange,
    handleTranslatedStepFieldChange,
    initializeEditorLanguages,
    initializeCreateLanguages,
    missingRequiredTranslations,
    missingOptionalTranslations,
    uncheckedLanguagesWithText,
  };
};

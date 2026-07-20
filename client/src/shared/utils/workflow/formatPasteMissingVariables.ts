function describeMissingTag(tag: string): string {
  if (tag.startsWith('forms[latest].')) {
    const questionId = tag.slice('forms[latest].'.length);
    return `form question "${questionId}"`;
  }
  if (tag.startsWith('forms[')) {
    return `form question "${tag}"`;
  }
  return `"${tag}"`;
}

/** Warning text when a pasted rule references variables missing on this step. */
export function formatMissingVariablesWarning(
  missingVariables: string[]
): string {
  if (missingVariables.length === 0) return '';

  const formMissing = missingVariables.filter(
    (tag) => tag.startsWith('forms[') || tag.startsWith('forms.')
  );
  const otherMissing = missingVariables.filter(
    (tag) => !tag.startsWith('forms[') && !tag.startsWith('forms.')
  );

  const parts: string[] = [];

  if (formMissing.length > 0) {
    const list = formMissing.map(describeMissingTag).join(', ');
    parts.push(
      `This condition used ${list} from another step, but that question is not on this step's form. ` +
        `The comparison and value were pasted; the form-question slot was left empty. ` +
        `Choose a matching question (or remove that part) before saving.`
    );
  }

  if (otherMissing.length > 0) {
    const list = otherMissing.map(describeMissingTag).join(', ');
    parts.push(
      `These variables are not available on this step: ${list}. ` +
        `Update or remove them before saving.`
    );
  }

  return parts.join(' ');
}

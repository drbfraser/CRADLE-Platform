import { WorkflowVariable } from 'src/shared/api';

const SOURCE_LABELS: Record<string, string> = {
  patient: 'Patient',
  forms: 'Form Questions',
  vitals: 'Vitals',
  pregnancy: 'Pregnancy',
  pregnancies: 'Pregnancy History',
  referrals: 'Referrals',
  assessments: 'Assessments',
  reading: 'Readings',
  wf: 'Workflow',
  global: 'Global',
  catalogue: 'Catalogue',
};

const SOURCE_ORDER = [
  'patient',
  'forms',
  'vitals',
  'pregnancy',
  'pregnancies',
  'referrals',
  'assessments',
  'reading',
  'wf',
  'global',
  'catalogue',
];

function sanitizeSourceKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_]/g, '_');
}

export function inferSourceKeyFromTag(tag: string): string {
  if (tag.startsWith('forms[') || tag.startsWith('forms.')) {
    return 'forms';
  }
  const dot = tag.indexOf('.');
  if (dot > 0) {
    return sanitizeSourceKey(tag.slice(0, dot));
  }
  return 'catalogue';
}

export function inferVariableSourceKey(v: WorkflowVariable): string {
  if (v.namespace) {
    return sanitizeSourceKey(v.namespace);
  }
  if (v.collectionName) {
    return sanitizeSourceKey(v.collectionName);
  }
  return inferSourceKeyFromTag(v.tag);
}

export function variableSourceLabel(sourceKey: string): string {
  return (
    SOURCE_LABELS[sourceKey] ??
    sourceKey.charAt(0).toUpperCase() + sourceKey.slice(1).replace(/_/g, ' ')
  );
}

export function variableBlockType(sourceKey: string, bType: string): string {
  return `app_variable_${sourceKey}_${bType}`;
}

export function groupVariablesBySource(
  variables: WorkflowVariable[]
): Map<string, WorkflowVariable[]> {
  const groups = new Map<string, WorkflowVariable[]>();
  for (const v of variables) {
    const key = inferVariableSourceKey(v);
    const list = groups.get(key) ?? [];
    list.push(v);
    groups.set(key, list);
  }
  return groups;
}

export function sortedSourceKeys(
  groups: Map<string, WorkflowVariable[]>
): string[] {
  return [...groups.keys()].sort((a, b) => {
    const aRank = SOURCE_ORDER.indexOf(a);
    const bRank = SOURCE_ORDER.indexOf(b);
    const aOrder = aRank === -1 ? SOURCE_ORDER.length : aRank;
    const bOrder = bRank === -1 ? SOURCE_ORDER.length : bRank;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.localeCompare(b);
  });
}

export function resolveVariableBlockType(
  tag: string,
  variables: WorkflowVariable[],
  bType: string
): string {
  const variable = variables.find((v) => v.tag === tag);
  const sourceKey = variable
    ? inferVariableSourceKey(variable)
    : inferSourceKeyFromTag(tag);
  return variableBlockType(sourceKey, bType);
}

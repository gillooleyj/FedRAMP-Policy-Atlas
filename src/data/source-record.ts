import type {Entity} from './types';

export type SourceScope = 'entry' | 'class' | 'dataset-default';
export type SourceFieldFormat = 'text' | 'ordered' | 'bullets' | 'artifacts' | 'structured';
export interface SourceField {
  key: string;
  label: string;
  value: unknown;
  locator: string;
  scope: SourceScope;
  scopeLabel: string;
  format: SourceFieldFormat;
}
export interface SourceRecordView {
  statement?: SourceField;
  statementState: 'present' | 'choose-class' | 'missing-class' | 'missing' | 'unsupported';
  force?: SourceField;
  entryFields: SourceField[];
  classFields: SourceField[];
  selectedClass: string;
  hasVariants: boolean;
  defaults?: SourceField;
}

const fieldSpecs: [string, string, SourceFieldFormat][] = [
  ['following_information', 'Following information', 'ordered'],
  ['following_information_bullets', 'Following information', 'bullets'],
  ['danger', 'Source warning', 'text'],
  ['note', 'Source note', 'text'],
  ['notes', 'Source notes', 'bullets'],
  ['artifacts', 'Artifacts', 'artifacts'],
  ['affects', 'Addresses', 'bullets'],
  ['effective_date', 'Published effective dates', 'structured'],
  ['timeframe_type', 'Timeframe type', 'text'],
  ['timeframe_num', 'Timeframe number', 'structured'],
  ['timeframe_num_min', 'Minimum timeframe number', 'structured'],
  ['timeframe_num_max', 'Maximum timeframe number', 'structured'],
  ['pain_timeframes', 'Published PAIN timeframes', 'structured'],
  ['corrective_actions', 'Corrective actions', 'ordered'],
  ['notification', 'Notification', 'structured'],
  ['reference', 'Published reference', 'text'],
  ['reference_url', 'Published reference URL', 'text'],
  ['reference_url_web_name', 'Published reference name', 'text'],
  ['related', 'Related identifiers in the source', 'bullets'],
  ['schema', 'Published artifact schema', 'structured'],
  ['examples', 'Published examples', 'structured'],
  ['rev5_controls_list', 'Published Rev5 control list', 'structured'],
  ['controls', 'Published control identifiers', 'bullets'],
];

export function isSourceObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function appendSourceLocator(base: string, ...parts: (string | number)[]): string {
  return base + parts.map(part => '/' + String(part).replaceAll('~', '~0').replaceAll('/', '~1')).join('');
}

function field(key: string, label: string, value: unknown, locator: string, scope: SourceScope, scopeLabel: string, format: SourceFieldFormat): SourceField {
  return {key, label, value, locator: appendSourceLocator(locator, key), scope, scopeLabel, format};
}

function supportingFields(raw: Record<string, unknown>, locator: string, scope: SourceScope, scopeLabel: string, kind: Entity['kind']): SourceField[] {
  const fields = fieldSpecs.filter(([key]) => Object.hasOwn(raw, key) && !(key === 'controls' && kind === 'ksi'))
    .map(([key, label, format]) => field(key, label, raw[key], locator, scope, scopeLabel, format));
  // These fields already have dedicated identity, statement, change-log or connection views.
  const handled = new Set(['name', 'statement', 'force', 'varies_by_class', 'updated', 'terms', ...fieldSpecs.map(([key]) => key)]);
  for (const [key, value] of Object.entries(raw)) {
    if (!handled.has(key)) fields.push(field(key, `Additional source field: ${key}`, value, locator, scope, scopeLabel, 'structured'));
  }
  return fields;
}

/** A presentation of the pinned fields, without merging class and entry values or resolving precedence. */
export function sourceRecordView(node: Entity, variant = '', sourceNode?: Entity): SourceRecordView | null {
  if (node.sourceId !== 'fedramp' || !['rule', 'ksi'].includes(node.kind)) return null;
  const raw = node.raw;
  const hasVariants = isSourceObject(raw.varies_by_class);
  const selectedClass = variant.toLowerCase();
  const supportedClass = /^[a-d]$/.test(selectedClass);
  const variantValue = hasVariants && supportedClass ? raw.varies_by_class?.[selectedClass] : undefined;
  const selected = isSourceObject(variantValue) ? variantValue : undefined;
  const selectedLocator = appendSourceLocator(node.sourceLocator, 'varies_by_class', selectedClass);
  const statementRaw = hasVariants ? selected : raw;
  const scope = hasVariants ? 'class' : 'entry';
  const scopeLabel = hasVariants ? `Class ${selectedClass.toUpperCase()}` : 'Entry';
  const statementLocator = hasVariants ? selectedLocator : node.sourceLocator;
  let statementState: SourceRecordView['statementState'] = 'missing';
  if (hasVariants && !selectedClass) statementState = 'choose-class';
  else if (hasVariants && !supportedClass) statementState = 'unsupported';
  else if (hasVariants && !selected) statementState = 'missing-class';
  else if (typeof statementRaw?.statement === 'string') statementState = 'present';
  else if (statementRaw && Object.hasOwn(statementRaw, 'statement')) statementState = 'unsupported';
  else if (hasVariants) statementState = 'missing-class';
  const statement = statementRaw && Object.hasOwn(statementRaw, 'statement')
    ? field('statement', 'Published statement', statementRaw.statement, statementLocator, scope, scopeLabel, 'text') : undefined;
  const force = node.kind === 'rule' && statementRaw && Object.hasOwn(statementRaw, 'force')
    ? field('force', 'Parent statement force', statementRaw.force, statementLocator, scope, scopeLabel, 'text') : undefined;
  const family = node.kind === 'rule' ? 'FRR' : 'KSI';
  const defaultContainer = sourceNode?.raw.default_artifacts;
  const matchingSource = sourceNode?.sourceId === node.sourceId && sourceNode.sourceCommit === node.sourceCommit && sourceNode.sourceVersion === node.sourceVersion;
  const defaults = matchingSource && isSourceObject(defaultContainer) && Object.hasOwn(defaultContainer, family)
    ? field(family, `Dataset-default artifacts (${family})`, defaultContainer[family], appendSourceLocator(sourceNode.sourceLocator, 'default_artifacts'), 'dataset-default', 'Dataset default', 'bullets') : undefined;
  return {
    statement, statementState, force, hasVariants, selectedClass,
    entryFields: supportingFields(raw, node.sourceLocator, 'entry', 'Entry', node.kind),
    classFields: selected ? supportingFields(selected, selectedLocator, 'class', `Class ${selectedClass.toUpperCase()}`, node.kind) : [],
    defaults,
  };
}

/** Only balanced Markdown strong emphasis is interpreted; all other content stays text. */
export function sourceTextParts(text: string): {text: string; strong: boolean}[] {
  return text.split(/(\*\*[^*\n]+\*\*)/g).filter(Boolean).map(part =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? {text: part.slice(2, -2), strong: true} : {text: part, strong: false});
}

export function sourceValueText(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2) ?? String(value);
}

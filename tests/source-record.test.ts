import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import SourceRecordContent from '../src/components/SourceRecordContent';
import {appendSourceLocator, sourceRecordView, sourceTextParts, sourceValueText} from '../src/data/source-record';
import type {SourceField} from '../src/data/source-record';
import type {Entity, Graph} from '../src/data/types';

const graph: Graph = JSON.parse(readFileSync('public/data/graph.json', 'utf8'));
const source = graph.nodes.find(node => node.id === 'fedramp')!;
const snapshot = JSON.parse(readFileSync(`public/data/snapshots/fedramp/${source.sourceCommit}/source.json`, 'utf8'));
const schema = JSON.parse(readFileSync(`public/data/snapshots/fedramp/${source.sourceCommit}/schema.json`, 'utf8'));
const entity = (id: string) => graph.nodes.find(node => node.sourceIdentifier === id)!;
const scg = entity('SCG-CSO-RSC');
const ksi = entity('KSI-CNA-EIS');
const pointer = (locator: string): unknown => locator.split('/').slice(1).reduce((value, part) =>
  (value as Record<string, unknown>)[part.replaceAll('~1', '/').replaceAll('~0', '~')], snapshot as unknown);
const render = (node: Entity, variant = '', sourceNode: Entity | undefined = source) =>
  renderToStaticMarkup(createElement(SourceRecordContent, {node, variant, sourceNode}));
const withoutCitations = (html: string) => html.replace(/<details class="source-record-citation">[\s\S]*?<\/details>/g, '');
const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
const field = (fields: SourceField[], key: string) => fields.find(item => item.key === key)!;
const withRaw = (raw: Record<string, unknown>): Entity => ({...scg, raw: raw as Entity['raw']});

describe('verbatim FedRAMP source records', () => {
  it('keeps the SCG parent statement, two required items and one recommended item in source order', () => {
    const view = sourceRecordView(scg, '', source)!;
    expect(view.statement?.value).toBe(pointer(`${scg.sourceLocator}/statement`));
    expect(view.force?.value).toBe('MUST');
    const following = field(view.entryFields, 'following_information');
    expect(following.value).toEqual(pointer(`${scg.sourceLocator}/following_information`));
    expect((following.value as string[]).map(text => text.split(':')[0])).toEqual(['Required', 'Required', 'Recommended']);
    expect(following.format).toBe('ordered');
    expect(field(view.entryFields, 'notes').value).toEqual(pointer(`${scg.sourceLocator}/notes`));
    expect(field(view.entryFields, 'artifacts').value).toEqual(pointer(`${scg.sourceLocator}/artifacts`));

    const html = render(scg);
    const visible = withoutCitations(html);
    expect(visible).toContain('<ol class="source-record-list">');
    expect(visible.match(/Required:/g)).toHaveLength(2);
    expect(visible.match(/Recommended:/g)).toHaveLength(1);
    expect(visible.match(/Parent statement force/g)).toHaveLength(1);
    expect(visible.indexOf('Required: Instructions')).toBeLessThan(visible.indexOf('Required: Explanations'));
    expect(visible.indexOf('Required: Explanations')).toBeLessThan(visible.indexOf('Recommended: Explanations'));
    expect(visible.indexOf('data-source-field="affects"')).toBeLessThan(visible.indexOf('data-source-field="statement"'));
    expect(visible.match(/data-source-field="affects"/g)).toHaveLength(1);
    expect(visible).toContain('URL to the human-readable data.');
    expect(visible).toContain('URL to the machine-readable data.');
  });

  it('cites individual following-information items and preserves their original text', () => {
    const html = render(scg);
    for (let index = 0; index < 3; index++) {
      const locator = `${scg.sourceLocator}/following_information/${index}`;
      expect(html).toContain(`data-source-locator="${locator}"`);
      expect(html).toContain(`<code class="source-record-locator">${locator}</code>`);
      expect(html).toContain(`<pre class="source-record-original" aria-label="Original source value">${escapeHtml(pointer(locator) as string)}</pre>`);
    }
    expect(html).toContain(`href="${source.sourceUrl}"`);
    expect(html).toContain(source.sourceCommit);
    expect(html).toContain(source.sourceVersion);
  });

  it('shows class B Optional emphasis safely and keeps the original Markdown in its source disclosure', () => {
    const view = sourceRecordView(ksi, 'B', source)!;
    expect(view.statement?.value).toBe(pointer(`${ksi.sourceLocator}/varies_by_class/b/statement`));
    expect(view.statement?.locator).toBe(`${ksi.sourceLocator}/varies_by_class/b/statement`);
    expect(view.statement?.scope).toBe('class');
    expect(view.force).toBeUndefined();
    const html = render(ksi, 'b');
    expect(withoutCitations(html)).toContain('<strong>Optional:</strong> Automated services');
    expect(html).toContain('>**Optional:** Automated services');
    expect(html).not.toContain('Parent statement force');
  });

  it('uses only class C wording and leaves class D missing without borrowing another class', () => {
    const classC = sourceRecordView(ksi, 'c', source)!;
    expect(classC.statement?.value).toBe(pointer(`${ksi.sourceLocator}/varies_by_class/c/statement`));
    expect(render(ksi, 'c')).not.toContain('Optional:');
    expect(classC.force).toBeUndefined();
    const classD = sourceRecordView(ksi, 'd', source)!;
    expect(classD.statementState).toBe('missing-class');
    expect(classD.statement).toBeUndefined();
    expect(classD.classFields).toEqual([]);
    const html = render(ksi, 'd');
    expect(html).toContain('Not specified in source for this class.');
    expect(html).not.toContain('Automated services are used');
    expect(html).not.toContain('Parent statement force');
  });

  it('preserves common fields and selected-class details as independent scopes', () => {
    const incident = entity('IEC-CSO-IIR');
    const view = sourceRecordView(incident, 'c', source)!;
    for (const key of ['following_information', 'pain_timeframes', 'artifacts']) {
      const value = field(view.classFields, key);
      expect(value.locator).toBe(`${incident.sourceLocator}/varies_by_class/c/${key}`);
      expect(value.value).toEqual(pointer(value.locator));
      expect(value.scope).toBe('class');
    }
    expect(view.force?.value).toBe('MUST');
    expect(sourceRecordView(incident, 'a', source)!.force?.value).toBe('SHOULD');
    for (const key of ['affects', 'notification', 'schema', 'related']) {
      const value = field(view.entryFields, key);
      expect(value.locator).toBe(`${incident.sourceLocator}/${key}`);
      expect(value.value).toEqual(pointer(value.locator));
      expect(value.scope).toBe('entry');
    }
    const html = withoutCitations(render(incident, 'c'));
    expect(html).toContain('Class C published fields');
    expect(html).toContain('Entry-level published fields, shown separately from class-specific fields.');
    expect(html).toContain('Follow agency-specific incident reporting procedures');
    expect(html).toContain('pain_timeframes');
  });

  it('does not merge entry, class or framework artifact buckets or infer precedence', () => {
    const node = withRaw({
      artifacts: {all: ['Entry all'], rev5: ['Entry rev5']},
      varies_by_class: {b: {statement: 'Class B statement', artifacts: {all: ['Class all'], '20x': ['Class 20x']}}},
    });
    const view = sourceRecordView(node, 'b', source)!;
    expect(field(view.entryFields, 'artifacts').value).toEqual({all: ['Entry all'], rev5: ['Entry rev5']});
    expect(field(view.classFields, 'artifacts').value).toEqual({all: ['Class all'], '20x': ['Class 20x']});
    const html = render(node, 'b');
    expect(html).toContain('Artifacts (entry)');
    expect(html).toContain('Artifacts (class b)');
    for (const locator of ['/artifacts/all/0', '/artifacts/rev5/0', '/varies_by_class/b/artifacts/all/0', '/varies_by_class/b/artifacts/20x/0']) {
      expect(html).toContain(`data-source-locator="${scg.sourceLocator}${locator}"`);
    }
    expect(html).toContain('Published bucket: 20x');
    expect(html).toContain('No precedence is inferred here.');
  });

  it('retains exact singular notes, source warnings, bullets, timeframes and corrective actions', () => {
    const fixtures = [
      ['IEC-CSO-EFI', 'following_information_bullets', 'bullets'],
      ['IEC-CSO-EFI', 'note', 'text'],
      ['AFC-CSO-INB', 'danger', 'text'],
      ['AFC-FRP-PNT', 'timeframe_type', 'text'],
      ['AFC-FRP-PNT', 'timeframe_num', 'structured'],
      ['AFC-FRP-PNT', 'notification', 'structured'],
      ['CCM-QTR-SAR', 'timeframe_num_min', 'structured'],
      ['CCM-QTR-SAR', 'timeframe_num_max', 'structured'],
      ['MKT-CAS-RFR', 'corrective_actions', 'ordered'],
    ];
    for (const [id, key, format] of fixtures) {
      const node = entity(id);
      const item = field(sourceRecordView(node, '', source)!.entryFields, key);
      expect(item.value).toEqual(pointer(`${node.sourceLocator}/${key}`));
      expect(item.format).toBe(format);
    }
    const noteHtml = withoutCitations(render(entity('IEC-CSO-EFI')));
    expect(noteHtml).toContain('<strong>N1</strong>');
    expect(noteHtml).toContain(escapeHtml(entity('IEC-CSO-EFI').raw.note as string));
    const dangerHtml = withoutCitations(render(entity('AFC-CSO-INB')));
    expect(dangerHtml).toContain('source-record-warning');
    expect(dangerHtml).toContain(escapeHtml(entity('AFC-CSO-INB').raw.danger as string));
  });

  it('locates dataset-default artifacts at /info and never substitutes them for entry artifacts', () => {
    for (const [node, family] of [[scg, 'FRR'], [ksi, 'KSI']] as const) {
      const view = sourceRecordView(node, 'b', source)!;
      expect(view.defaults?.scope).toBe('dataset-default');
      expect(view.defaults?.locator).toBe(`/info/default_artifacts/${family}`);
      expect(view.defaults?.value).toEqual(pointer(`/info/default_artifacts/${family}`));
      const html = render(node, 'b');
      expect(html).toContain(`<summary>Dataset-default artifacts (${family})</summary>`);
      expect(html).toContain(`data-source-locator="/info/default_artifacts/${family}/0"`);
    }
    expect(sourceRecordView(ksi, 'b', source)!.entryFields.some(item => item.key === 'artifacts')).toBe(false);
    const mismatched = {...source, sourceCommit: 'different-revision'};
    expect(sourceRecordView(scg, '', mismatched)!.defaults).toBeUndefined();
    expect(render(scg, '', mismatched)).toContain('not available from a matching source revision');
  });

  it('covers every supporting field in the pinned rules and class schema without hiding qualifiers', () => {
    const dedicatedFields = new Set(['name', 'statement', 'force', 'varies_by_class', 'updated', 'terms']);
    for (const node of graph.nodes.filter(node => node.sourceId === 'fedramp' && ['rule', 'ksi'].includes(node.kind))) {
      const ignored = new Set([...dedicatedFields, ...(node.kind === 'ksi' ? ['controls'] : [])]);
      const common = sourceRecordView(node, '', source)!;
      expect(common.entryFields.map(item => item.key).sort()).toEqual(Object.keys(node.raw).filter(key => !ignored.has(key)).sort());
      for (const item of common.entryFields) expect(item.value).toEqual(pointer(item.locator));
      for (const [variant, raw] of Object.entries(node.raw.varies_by_class ?? {})) {
        const selected = sourceRecordView(node, variant, source)!;
        expect(selected.classFields.map(item => item.key).sort()).toEqual(Object.keys(raw).filter(key => !ignored.has(key)).sort());
        for (const item of selected.classFields) expect(item.value).toEqual(pointer(item.locator));
      }
    }
    // Pin schema expectations so new consequential fields cannot silently skip this audit.
    expect(Object.keys(schema.$defs.frr_requirement.properties)).toContain('notification');
    expect(Object.keys(schema.$defs.frr_requirement_level.properties)).toContain('pain_timeframes');
    expect(Object.keys(schema.$defs.ksi_indicator_level.properties)).not.toContain('force');
  });

  it('handles common selection, absent statements and unsupported entities or class selections explicitly', () => {
    expect(sourceRecordView(ksi, '', source)!.statementState).toBe('choose-class');
    expect(render(ksi)).toContain('Choose a certification class above');
    expect(sourceRecordView(ksi, 'e', source)!.statementState).toBe('unsupported');
    expect(render(ksi, 'e')).toContain('This class selection is not supported');
    expect(sourceRecordView(withRaw({name: 'Missing'}), '', source)!.statementState).toBe('missing');
    expect(render(withRaw({name: 'Missing'}))).toContain('Statement not specified in this source record.');
    expect(sourceRecordView(source)).toBeNull();
    expect(sourceRecordView({...scg, sourceId: 'nist'})).toBeNull();
    expect(render(source)).toBe('');
    const unexpected = withRaw({statement: {unexpected: 'value'}});
    expect(sourceRecordView(unexpected)!.statementState).toBe('unsupported');
    expect(render(unexpected)).toContain('The published statement has an unexpected data type.');
    expect(render(unexpected)).toContain('<dt>unexpected</dt>');
  });

  it('escapes unusual keys and retains unknown source fields instead of discarding them', () => {
    const node = withRaw({statement: 'Published text.', 'extra/key~name': {value: 'Published qualifier'}});
    const extra = sourceRecordView(node)!.entryFields[0];
    expect(extra.locator).toBe(`${scg.sourceLocator}/extra~1key~0name`);
    expect(extra.value).toEqual({'value': 'Published qualifier'});
    expect(render(node)).toContain('Additional source field: extra/key~name');
    expect(appendSourceLocator('/info', 'a/b~c', 0)).toBe('/info/a~1b~0c/0');
  });

  it('preserves source disclosures for empty lists and artifact buckets', () => {
    const html = render(withRaw({statement: 'Published statement.', following_information: [], artifacts: {all: []}}));
    for (const suffix of ['/following_information', '/artifacts/all']) {
      expect(html).toContain(`<code class="source-record-locator">${scg.sourceLocator}${suffix}</code>`);
    }
    expect(html.match(/The published field is empty\./g)).toHaveLength(2);
    expect(html.match(/aria-label="Original source value">\[\]<\/pre>/g)).toHaveLength(2);
    expect(html).not.toContain('<ul class="source-record-list"></ul>');
  });

  it('only interprets balanced strong emphasis and always treats HTML as inert source text', () => {
    expect(sourceTextParts('**Optional:** Exact [link](https://example.test) **unfinished')).toEqual([
      {text: 'Optional:', strong: true},
      {text: ' Exact [link](https://example.test) **unfinished', strong: false},
    ]);
    const malicious = '<script>alert(1)</script> **Optional:** [link](javascript:alert(1))';
    const html = render(withRaw({statement: malicious}));
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="javascript:');
    expect(withoutCitations(html)).toContain('&lt;script&gt;alert(1)&lt;/script&gt; <strong>Optional:</strong>');
    expect(html).toContain(escapeHtml(malicious));
    expect(sourceValueText({number: 0.25})).toBe('{\n  "number": 0.25\n}');
  });
});

import {Fragment} from 'react';
import type {Entity} from '../data/types';
import {appendSourceLocator, isSourceObject, sourceRecordView, sourceTextParts, sourceValueText} from '../data/source-record';
import type {SourceField} from '../data/source-record';

function SourceText({text}: {text: string}) {
  return <>{sourceTextParts(text).map((part, index) => part.strong
    ? <strong key={index}>{part.text}</strong> : <Fragment key={index}>{part.text}</Fragment>)}</>;
}

function SourceCitation({field, node}: {field: SourceField; node: Entity}) {
  return <details className="source-record-citation">
    <summary aria-label={`Source details: ${field.label} (${field.scopeLabel})`}>Source details</summary>
    <div className="source-record-citation-content">
      <p>Source version <strong>{node.sourceVersion}</strong></p>
      <code className="source-record-locator">{field.locator}</code>
      <p className="source-record-commit">Commit <code>{node.sourceCommit}</code></p>
      <a href={node.sourceUrl} target="_blank" rel="noreferrer">Open pinned source</a>
      <pre className="source-record-original" aria-label="Original source value">{sourceValueText(field.value)}</pre>
    </div>
  </details>;
}

function SourceValue({value}: {value: unknown}) {
  if (typeof value === 'string') {
    const safeUrl = /^https?:\/\/[^\s]+$/i.test(value);
    return <span className="source-record-text">{safeUrl
      ? <a href={value} target="_blank" rel="noreferrer">{value}</a>
      : <SourceText text={value}/>}</span>;
  }
  if (Array.isArray(value)) return <ul className="source-record-structured-list">{value.map((item, index) => <li key={index}><SourceValue value={item}/></li>)}</ul>;
  if (isSourceObject(value)) return <dl className="source-record-structured">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{key}</dt><dd><SourceValue value={item}/></dd></div>)}</dl>;
  return <span className="source-record-text">{sourceValueText(value)}</span>;
}

function SourceList({field, node, ordered = false}: {field: SourceField; node: Entity; ordered?: boolean}) {
  const values = field.value as unknown[];
  if (values.length === 0) return <><p className="hint">The published field is empty.</p><SourceCitation field={field} node={node}/></>;
  const List = ordered ? 'ol' : 'ul';
  return <List className="source-record-list">{values.map((value, index) => {
    const item = {...field, value, locator: appendSourceLocator(field.locator, index), label: `${field.label}, item ${index + 1}`};
    return <li key={item.locator} data-source-locator={item.locator}>
      <SourceValue value={value}/><SourceCitation field={item} node={node}/>
    </li>;
  })}</List>;
}

function SourceFieldContent({field, node, heading = true}: {field: SourceField; node: Entity; heading?: boolean}) {
  const list = ['ordered', 'bullets'].includes(field.format) && Array.isArray(field.value);
  const artifacts = field.format === 'artifacts' && isSourceObject(field.value);
  return <section className={`source-record-field${field.key === 'danger' ? ' source-record-warning' : ''}${field.format === 'artifacts' ? ' source-record-artifacts' : ''}`}
    data-source-field={field.key} data-source-scope={field.scope} data-source-locator={field.locator}>
    {heading && <h4>{field.label}{field.key === 'artifacts' ? ` (${field.scopeLabel.toLowerCase()})` : ''}</h4>}
    {list ? <SourceList field={field} node={node} ordered={field.format === 'ordered'}/> : artifacts
      ? Object.entries(field.value as Record<string, unknown>).map(([bucket, value]) => {
        const item = {...field, value, locator: appendSourceLocator(field.locator, bucket), label: `Artifacts: ${bucket}`};
        return <div className="source-record-artifact-bucket" key={bucket} data-source-locator={item.locator}>
          <h5>Published bucket: {bucket}</h5>
          {Array.isArray(value) ? <SourceList field={item} node={node}/> : <><SourceValue value={value}/><SourceCitation field={item} node={node}/></>}
        </div>;
      })
      : <><div className={field.key === 'statement' ? 'statement source-record-text' : 'source-record-value'}><SourceValue value={field.value}/></div><SourceCitation field={field} node={node}/></>}
    {artifacts && Object.keys(field.value as Record<string, unknown>).length === 0 &&
      <><p className="hint">The published field is empty.</p><SourceCitation field={field} node={node}/></>}
  </section>;
}

export default function SourceRecordContent({node, variant, sourceNode}: {node: Entity; variant: string; sourceNode?: Entity}) {
  const view = sourceRecordView(node, variant, sourceNode);
  if (!view) return null;
  const addresses = view.entryFields.find(field => field.key === 'affects');
  const entryFields = view.entryFields.filter(field => field.key !== 'affects');
  return <div className="source-record" role="region" aria-label="Published source content">
    <p className="source-record-revision">Published snapshot <strong>{node.sourceVersion}</strong></p>
    {addresses && <div className="source-record-addresses" data-source-field="affects" data-source-scope="entry" data-source-locator={addresses.locator}>
      <span className="source-record-metadata-label">{addresses.label}</span><SourceValue value={addresses.value}/><SourceCitation field={addresses} node={node}/>
    </div>}
    {view.statement && view.statementState === 'unsupported' && <p className="source-record-missing">The published statement has an unexpected data type. Its source value is preserved below.</p>}
    {view.statement ? <SourceFieldContent field={view.statement} node={node} heading={false}/> :
      <p className="statement source-record-missing">{view.statementState === 'choose-class'
        ? 'Choose a certification class above to read its published statement.'
        : view.statementState === 'missing-class' ? 'Not specified in source for this class.'
        : view.statementState === 'unsupported' ? 'This class selection is not supported by the source reader.'
        : 'Statement not specified in this source record.'}</p>}
    {view.force && <div className="force source-record-force" data-source-field="force" data-source-scope={view.force.scope} data-source-locator={view.force.locator}>
      Parent statement force <strong>{sourceValueText(view.force.value)}</strong><SourceCitation field={view.force} node={node}/>
    </div>}
    {view.classFields.length > 0 && <div className="source-record-group">
      <p className="source-record-scope">Class {view.selectedClass.toUpperCase()} published fields</p>
      {view.classFields.map(field => <SourceFieldContent key={field.locator} field={field} node={node}/>)}
    </div>}
    {entryFields.length > 0 && <div className="source-record-group">
      {view.hasVariants && <p className="source-record-scope">Entry-level published fields, shown separately from class-specific fields.</p>}
      {entryFields.map(field => <SourceFieldContent key={field.locator} field={field} node={node}/>)}
    </div>}
    <details className="source-record-defaults">
      <summary>{view.defaults?.label ?? `Dataset-default artifacts (${node.kind === 'rule' ? 'FRR' : 'KSI'})`}</summary>
      <p className="hint">Published dataset defaults are shown separately from entry and class-specific artifact fields. No precedence is inferred here.</p>
      {view.defaults && sourceNode ? <SourceFieldContent field={view.defaults} node={sourceNode} heading={false}/>
        : <p className="hint">Dataset-default artifact information is not available from a matching source revision in this graph.</p>}
    </details>
  </div>;
}

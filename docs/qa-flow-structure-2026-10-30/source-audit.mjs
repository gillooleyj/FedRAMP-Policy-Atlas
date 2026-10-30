import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
const root='public/data/snapshots/fedramp/a89d78477ddea98dc57eca24f5007794c2b4eeb6/';
const [raw,schema,graph]=await Promise.all([root+'source.json',root+'schema.json','public/data/graph.json'].map(async p=>JSON.parse(await readFile(p,'utf8'))));
const ajv=new Ajv({strict:false,allErrors:true});addFormats(ajv);assert.equal(ajv.validate(schema,raw),true,JSON.stringify(ajv.errors));
const pointer='/FRD/data/all/FRD-CCL',classes=['A','B','C','D'];
for(const c of classes){const n=graph.nodes.find(n=>n.id==='class:'+c);assert.equal(n.sourceId,'fedramp');assert.equal(n.sourceLocator,pointer);assert.deepEqual(n.raw,raw.FRD.data.all['FRD-CCL']);assert.ok(graph.edges.some(e=>e.from===n.id&&e.to==='fr:FRD-CCL'&&e.type==='DEFINED_BY'&&e.sourceLocator===pointer+'/definition'));assert.equal(graph.edges.some(e=>e.from==='fedramp'&&e.to===n.id&&e.type==='CONTAINS'),false);}
assert.equal(graph.edges.some(e=>e.from==='fedramp'&&e.to==='nist'&&e.type==='CONTAINS'),false);
assert.equal(raw.KSI.CNA.indicators['KSI-CNA-EIS'].controls[8],'si-7');
assert.match(raw.KSI.CNA.indicators['KSI-CNA-EIS'].varies_by_class.b.statement,/^\*\*Optional:\*\*/);
assert.deepEqual(raw.FRR.FRC.info.subsets.CLA.applicability.classes,['A']);
assert.deepEqual(raw.FRR.FRC.info['20x'].subsets.CSX.applicability.classes,['B','C','D']);
const ksis=Object.values(raw.KSI).flatMap(t=>Object.values(t.indicators));
const report={source:graph.sources.find(s=>s.id==='fedramp'),schemaValidation:'passed',classDefinition:raw.FRD.data.all['FRD-CCL'].definition,classDefinitionPointer:pointer+'/definition',classApplicabilityIncoming:Object.fromEntries(classes.map(c=>[c,graph.edges.filter(e=>e.to==='class:'+c&&e.type==='APPLIES_TO').length])),ksiCount:ksis.length,ksiCommonStatements:ksis.filter(k=>k.statement).length,ksiVariantCounts:Object.fromEntries(classes.map(c=>[c,ksis.filter(k=>k.varies_by_class?.[c.toLowerCase()]).length])),ksiClassEdges:graph.edges.filter(e=>e.type==='APPLIES_TO'&&graph.nodes.find(n=>n.id===e.from)?.kind==='ksi').length,publishedMappings:graph.edges.filter(e=>e.type==='PUBLISHED_CONTROL_MAPPING').length,claims:['Classes have explicit FedRAMP definition provenance; no direct structural FedRAMP→class edge currently exists.','NIST is a separately imported peer source, not a FedRAMP-contained source.','Display source grouping does not create verified relationship edges.']};
await writeFile('docs/qa-flow-structure-2026-10-30/source-audit-results.json',JSON.stringify(report,null,2)+'\n');console.log('Source schema, class origin, peer roots, mapping pointer and applicability pointers verified.');

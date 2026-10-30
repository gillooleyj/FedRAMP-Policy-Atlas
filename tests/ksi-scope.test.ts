import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {buildGraph} from '../scripts/graph.mjs';
import {diffGraphs} from '../scripts/update-core.mjs';
import {matchesClass} from '../src/graph/model';
import type {Graph} from '../src/data/types';
const graph:Graph=JSON.parse(readFileSync('public/data/graph.json','utf8'));
const load=(id:string)=>JSON.parse(readFileSync(`public/data/snapshots/${id}/${graph.sources.find(s=>s.id===id)!.commit}/source.json`,'utf8'));
const rules=load('fedramp'),catalog=load('nist');
const scope=graph.edges.filter(e=>e.type==='APPLIES_TO'&&e.from.startsWith('fr:KSI-'));
const resolve=(p:string)=>p.split('/').slice(1).reduce((o,k)=>o?.[k.replaceAll('~1','/').replaceAll('~0','~')],rules);
it('imports the seven explicitly named Class A indicators and all 46 in B/C/D process scope',()=>{
 const named=['KSI-CMT-LMC','KSI-CNA-RNT','KSI-CED-RAT','KSI-IAM-AAM','KSI-IAM-APM','KSI-INR-RIR','KSI-SVC-SIN'].sort();
 expect(scope).toHaveLength(145);
 expect(scope.filter(e=>e.to==='class:A').map(e=>e.from.slice(3)).sort()).toEqual(named);
 for(const cls of ['A','B','C','D']){const ids=scope.filter(e=>e.to==='class:'+cls).map(e=>e.from).sort();expect(ids).toHaveLength(cls==='A'?7:46);expect(graph.nodes.filter(n=>n.kind==='ksi'&&matchesClass(n,cls)).map(n=>n.id).sort()).toEqual(ids);}
});
it('retains independently resolvable evidence, process force, scope and dates on every KSI class link',()=>{
 for(const e of scope){expect(resolve(e.sourceLocator)).toBeDefined();expect(e.supportingEvidence!.length).toBeGreaterThanOrEqual(4);for(const item of e.supportingEvidence!)expect(resolve(item.locator)).toEqual(item.value);expect(e.applicability!.processForce).toBe(e.to==='class:A'?'MUST':'SHOULD');expect(e.applicability!.effective).toEqual(rules.FRR.FRC.info['20x'].effective);}
});
it('keeps optional B wording and missing D wording distinct without changing the raw indicators',()=>{
 const expected=['KSI-CNA-EIS','KSI-MLA-ALA','KSI-SVC-PRR','KSI-SVC-RUD','KSI-SVC-VCM'];
 expect(scope.filter(e=>e.to==='class:B'&&e.applicability?.statementQualifier==='Optional').map(e=>e.from.slice(3)).sort()).toEqual(expected);
 expect(scope.filter(e=>e.to==='class:D'&&e.applicability?.statementKind==='missing-class-specific').map(e=>e.from.slice(3)).sort()).toEqual(expected);
 for(const n of graph.nodes.filter(n=>n.kind==='ksi')){expect(n.raw).toEqual(resolve(n.sourceLocator));expect(n.raw.force).toBeUndefined();}
 expect(scope.filter(e=>e.to==='class:C'&&e.applicability?.statementQualifier)).toHaveLength(0);
});
it('fails closed if governing wording or named references change meaning',()=>{
 const changed=structuredClone(rules);changed.FRR.FRC.data['20x'].CSX['FRC-CSX-MAS'].statement='Providers MAY apply some indicators.';
 expect(()=>buildGraph(changed,catalog.catalog,graph.sources)).toThrow('governing wording changed');
 const missing=structuredClone(rules);missing.FRR.FRC.data.all.CLA['FRC-CLA-MFR'].following_information.push('Key Security Indicators: KSI-FAKE-NO (Unknown)');
 expect(()=>buildGraph(missing,catalog.catalog,graph.sources)).toThrow('Unresolved');
});
it('detects changes to supporting evidence in update review reports',()=>{const changed=structuredClone(graph);changed.edges.find(e=>e.supportingEvidence)!.supportingEvidence![0].value='Changed evidence';expect(diffGraphs(graph,changed).summary.edgeEvidenceChanged).toBe(1);});
it('repairs only class scope and leaves all previously published relationships and raw records intact',()=>{
 const old:Graph=JSON.parse(readFileSync('public/data/graphs/5cda3bb3c29d199d.json','utf8'));
 expect(diffGraphs(old,graph).summary).toEqual({nodesAdded:0,nodesRemoved:0,nodesChanged:46,edgesAdded:145,edgesRemoved:0,edgeEvidenceChanged:0,mappingsAdded:0,mappingsRemoved:0});
 for(const n of old.nodes)expect(graph.nodes.find(x=>x.id===n.id)!.raw).toEqual(n.raw);
});

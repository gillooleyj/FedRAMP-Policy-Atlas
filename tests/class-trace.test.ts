import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import type {Graph} from '../src/data/types';
import {classControlTrace} from '../src/graph/class-trace';
const graph:Graph=JSON.parse(readFileSync('public/data/graph.json','utf8'));
it('follows every supported class KSI to every exact published target, without invented class-control edges',()=>{
 for(const cls of ['A','B','C','D']){
  const t=classControlTrace(graph,'class:'+cls);expect(t.scopeEdges).toHaveLength(cls==='A'?7:46);
  const expected=graph.edges.filter(e=>e.type==='PUBLISHED_CONTROL_MAPPING'&&t.indicators.some(n=>n.id===e.from)&&(!e.applicability?.classes||e.applicability.classes.includes(cls)));
  expect(t.mappings).toEqual(expected);expect(t.controlCount).toBe(new Set(expected.map(e=>e.to)).size);
  for(const e of t.edges)expect(graph.edges).toContain(e);
  expect(t.edges.some(e=>e.from==='class:'+cls&&e.to.startsWith('nist:'))).toBe(false);
 }
});
it('keeps a single complete path including every control enhancement without the ordinary card cap',()=>{
 const t=classControlTrace(graph,'class:B','fr:KSI-CNA-EIS');expect(t.scopeEdges).toHaveLength(1);expect(t.mappings).toHaveLength(12);expect(t.nodes).toHaveLength(14);expect(t.nodes.some(n=>n.kind==='enhancement')).toBe(true);expect([...t.distances.values()].filter(d=>d===2)).toHaveLength(12);
});
it('retains optional and missing wording as evidence instead of assigning a control baseline',()=>{const b=classControlTrace(graph,'class:B','fr:KSI-CNA-EIS'),d=classControlTrace(graph,'class:D','fr:KSI-CNA-EIS');expect(b.scopeEdges[0].applicability?.statementQualifier).toBe('Optional');expect(d.scopeEdges[0].applicability?.statementKind).toBe('missing-class-specific');expect(b.mappings).toEqual(d.mappings);});
it('excludes candidate and wrong-class mappings and preserves KSIs with no published mapping',()=>{
 const changed=structuredClone(graph);for(const e of changed.edges.filter(e=>e.from==='fr:KSI-CNA-EIS'&&e.type==='PUBLISHED_CONTROL_MAPPING'))e.applicability={classes:['C']};
 expect(classControlTrace(changed,'class:B','fr:KSI-CNA-EIS').mappings).toHaveLength(0);expect(classControlTrace(changed,'class:B','fr:KSI-CNA-EIS').nodes).toHaveLength(2);
 for(const e of changed.edges)e.provenanceStatus='candidate';expect(classControlTrace(changed,'class:B').edges).toHaveLength(0);
 expect(classControlTrace(graph,'class:A','fr:KSI-CNA-EIS').mappings).toHaveLength(0);
});

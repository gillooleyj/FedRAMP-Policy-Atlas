import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import type {Graph} from '../src/data/types';
import {containmentTrail} from '../src/graph/journey';
import {flowLayout,flowArrangement} from '../src/graph/flow-layout';
import {flowCard} from '../src/graph/flow';
import {connectionNeighborhood} from '../src/graph/exploration';
const graph:Graph=JSON.parse(readFileSync('public/data/graph.json','utf8'));
describe('exploration return paths and stable card placement',()=>{
 it('uses actual containment ancestors rather than mappings or class applicability',()=>{expect(containmentTrail('fr:KSI-CNA-EIS',graph.nodes,graph.edges)).toEqual(['fedramp','theme:CNA']);expect(containmentTrail('class:B',graph.nodes,graph.edges)).toEqual([]);expect(containmentTrail('nist:ac-2',graph.nodes,graph.edges)).toEqual(['nist','nist:ac']);});
 it('does not restore filtered ancestors or follow candidate containment and terminates cycles',()=>{const candidate={...graph.edges[0],id:'fake',from:'fedramp',to:'class:B',type:'CONTAINS',provenanceStatus:'candidate'};expect(containmentTrail('class:B',graph.nodes,[candidate])).toEqual([]);expect(containmentTrail('fr:KSI-CNA-EIS',graph.nodes.filter(n=>n.id!=='theme:CNA'),graph.edges)).toEqual([]);const cycle={...graph.edges[0],id:'cycle',from:'theme:CNA',to:'fedramp',type:'CONTAINS',provenanceStatus:'verified'};expect(containmentTrail('fr:KSI-CNA-EIS',graph.nodes,[...graph.edges,cycle])).toEqual(['fedramp','theme:CNA']);});
 it('places classes below their source and peer sources at the same level',()=>{const nodes=graph.nodes.filter(n=>n.kind==='class'||n.kind==='source'),positions=flowLayout(nodes);expect(positions.get('fedramp')!.y).toBe(positions.get('nist')!.y);for(const n of nodes.filter(n=>n.kind==='class'))expect(positions.get(n.id)!.y).toBeGreaterThan(positions.get('fedramp')!.y);expect(new Set(nodes.filter(n=>n.kind==='class').map(n=>positions.get(n.id)!.y)).size).toBe(1);});
 it('has no cache-dependent positions or overlaps after unrelated views',()=>{const n=connectionNeighborhood('class:D',graph.edges,1,new Set(graph.nodes.map(n=>n.id))),nodes=graph.nodes.filter(x=>n.distances.has(x.id)).slice(0,24);const before=flowArrangement(nodes);flowLayout(graph.nodes);expect(flowArrangement(nodes)).toEqual(before);const boxes=[...before.positions.values()];for(let i=0;i<boxes.length;i++)for(const b of boxes.slice(i+1)){const a=boxes[i];expect(a.x<b.x+flowCard.width&&a.x+flowCard.width>b.x&&a.y<b.y+flowCard.height&&a.y+flowCard.height>b.y).toBe(false);}});
});

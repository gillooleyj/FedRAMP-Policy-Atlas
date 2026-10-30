import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import type {Graph} from '../src/data/types';
import {containmentTrail} from '../src/graph/journey';
import {flowLayout,anchoredFlowLayout} from '../src/graph/flow-layout';
import {flowCard} from '../src/graph/flow';
import {connectionNeighborhood} from '../src/graph/exploration';
const graph:Graph=JSON.parse(readFileSync('public/data/graph.json','utf8'));
describe('exploration return paths and stable card placement',()=>{
 it('uses actual containment ancestors rather than mappings or class applicability',()=>{expect(containmentTrail('fr:KSI-CNA-EIS',graph.nodes,graph.edges)).toEqual(['fedramp','theme:CNA']);expect(containmentTrail('class:B',graph.nodes,graph.edges)).toEqual([]);expect(containmentTrail('nist:ac-2',graph.nodes,graph.edges)).toEqual(['nist','nist:ac']);});
 it('does not restore filtered ancestors or follow candidate containment and terminates cycles',()=>{const candidate={...graph.edges[0],id:'fake',from:'fedramp',to:'class:B',type:'CONTAINS',provenanceStatus:'candidate'};expect(containmentTrail('class:B',graph.nodes,[candidate])).toEqual([]);expect(containmentTrail('fr:KSI-CNA-EIS',graph.nodes.filter(n=>n.id!=='theme:CNA'),graph.edges)).toEqual([]);const cycle={...graph.edges[0],id:'cycle',from:'theme:CNA',to:'fedramp',type:'CONTAINS',provenanceStatus:'verified'};expect(containmentTrail('fr:KSI-CNA-EIS',graph.nodes,[...graph.edges,cycle])).toEqual(['fedramp','theme:CNA']);});
 it('keeps certification classes at their exact starting coordinates despite incoming applicability edges',()=>{const classes=graph.nodes.filter(n=>n.kind==='class'),base=flowLayout(classes,[]),n=connectionNeighborhood('class:B',graph.edges,1,new Set(graph.nodes.map(n=>n.id))),nodes=graph.nodes.filter(x=>n.distances.has(x.id)),before=JSON.stringify([...base]);const positions=anchoredFlowLayout(nodes,n.edges,base);expect(positions.get('class:B')).toEqual(base.get('class:B'));expect(JSON.stringify([...base])).toBe(before);for(const [id,p] of positions)for(const [other,q] of positions)if(id!==other)expect(p.x<q.x+flowCard.width&&p.x+flowCard.width>q.x&&p.y<q.y+flowCard.height&&p.y+flowCard.height>q.y).toBe(false);});
 it('retains every visited card across expansion and gives new cards deterministic unused slots',()=>{const nodes=graph.nodes.slice(0,15),base=flowLayout(nodes.slice(0,5),[]),a=anchoredFlowLayout(nodes,[],base),b=anchoredFlowLayout([...nodes].reverse(),[],base);expect(a).toEqual(b);for(const [id,p] of base)expect(a.get(id)).toEqual(p);expect(a.size).toBe(15);});
});

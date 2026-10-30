import dagre from '@dagrejs/dagre';
import type {Edge,Entity} from '../data/types';
import {flowCard} from './flow';
/** Dagre positions cards only; original edge identity, direction and evidence remain untouched. */
export function flowLayout(nodes:Entity[],edges:Edge[]){
 const graph=new dagre.graphlib.Graph({multigraph:true});graph.setGraph({rankdir:'LR',nodesep:34,ranksep:100,marginx:28,marginy:28});graph.setDefaultEdgeLabel(()=>({}));
 for(const n of [...nodes].sort((a,b)=>a.id.localeCompare(b.id)))graph.setNode(n.id,{...flowCard});
 for(const e of [...edges].sort((a,b)=>a.id.localeCompare(b.id)))if(graph.hasNode(e.from)&&graph.hasNode(e.to))graph.setEdge(e.from,e.to,{},e.id);
 dagre.layout(graph);
 const positions=new Map(nodes.map(n=>{const p=graph.node(n.id);return [n.id,{x:p.x-flowCard.width/2,y:p.y-flowCard.height/2}];}));
 const ranks=new Map<number,string[]>();for(const [id,p] of positions)ranks.set(p.x,[...(ranks.get(p.x)??[]),id]);
 // Wide fan-outs wrap into short columns instead of shrinking a tall list to illegible cards.
 if([...ranks.values()].some(ids=>ids.length>6)){
  let column=0;const rows=5,rowHeight=flowCard.height+34,columnWidth=flowCard.width+70;
  for(const [,ids] of [...ranks].sort(([a],[b])=>a-b)){
   ids.sort((a,b)=>positions.get(a)!.y-positions.get(b)!.y||a.localeCompare(b));
   for(let start=0;start<ids.length;start+=rows){const chunk=ids.slice(start,start+rows);chunk.forEach((id,i)=>positions.set(id,{x:28+column*columnWidth,y:28+(i+(rows-chunk.length)/2)*rowHeight}));column++;}
  }
 }
 return positions;
}

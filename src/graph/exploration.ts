import type {Edge,Entity,Kind} from '../data/types';
import type {Position} from './model';

/** Navigation regions are presentation metadata, never source entities or graph edges. */
export const regions:{id:string;title:string;color:string;kinds:Kind[];groupKind:Kind}[]=[
 {id:'rules',title:'Rulesets',color:'#59a9ff',kinds:['ruleset','subset','rule'],groupKind:'ruleset'},
 {id:'nist',title:'Families',color:'#f3bb62',kinds:['family','control','enhancement'],groupKind:'family'},
 {id:'ksi',title:'KSI themes',color:'#ee89c8',kinds:['theme','ksi'],groupKind:'theme'},
 {id:'classes',title:'Classes',color:'#b99aef',kinds:['class'],groupKind:'class'},
 {id:'definitions',title:'Definitions',color:'#66c5cc',kinds:['definition'],groupKind:'definition'},
];
export function regionPoints(id:string,nodes:Entity[],positions:Map<string,Position>){
 const region=regions.find(r=>r.id===id);
 return nodes.filter(n=>region?.kinds.includes(n.kind)).map(n=>positions.get(n.id)!).filter(Boolean);
}
export function centroid(points:Position[]):Position|null{
 if(!points.length)return null;
 return points.reduce((sum,p)=>sum.map((v,i)=>v+p[i]/points.length) as Position,[0,0,0] as Position);
}
/** Shortest path distances in either direction, using only the supplied verified edges.
 * A path is navigational connectivity, not a new transitive mapping or requirement.
 */
export function connectionNeighborhood(id:string,edges:Edge[],depth:number,allowed:Set<string>){
 const distances=new Map<string,number>();
 if(!allowed.has(id))return {distances,edges:[] as Edge[]};
 distances.set(id,0);
 const adjacency=new Map<string,string[]>();
 const valid=edges.filter(e=>e.provenanceStatus==='verified'&&allowed.has(e.from)&&allowed.has(e.to));
 for(const e of valid){adjacency.set(e.from,[...(adjacency.get(e.from)??[]),e.to]);adjacency.set(e.to,[...(adjacency.get(e.to)??[]),e.from]);}
 const limit=Math.max(0,Math.min(3,Math.floor(depth))),queue=[id];
 for(let i=0;i<queue.length;i++){const from=queue[i],distance=distances.get(from)!;if(distance>=limit)continue;
  for(const to of adjacency.get(from)??[])if(!distances.has(to)){distances.set(to,distance+1);queue.push(to);}
 }
 // Include all real edges explored before the boundary, preserving direction and provenance.
 return {distances,edges:valid.filter(e=>distances.has(e.from)&&distances.has(e.to)&&Math.min(distances.get(e.from)!,distances.get(e.to)!)<limit)};
}

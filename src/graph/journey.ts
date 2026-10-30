import type {Entity,Edge} from '../data/types';
import type {Position} from './model';
export interface MapView {position:Position;target:Position;region?:string;regionDistance?:number}
export interface ChartView {x:number;y:number;zoom:number}
export interface ViewReader<T> {capture:()=>T}
/** Navigation follows explicit containment only, never applicability or mappings. */
export function containmentTrail(selected:string,nodes:Entity[],edges:Edge[]){
 const available=new Set(nodes.map(n=>n.id)),seen=new Set([selected]),trail:string[]=[];
 let child=selected;
 while(child){const parent=edges.filter(e=>e.type==='CONTAINS'&&e.provenanceStatus==='verified'&&e.to===child&&available.has(e.from)).sort((a,b)=>a.id.localeCompare(b.id)).find(e=>!seen.has(e.from));if(!parent)break;trail.unshift(parent.from);seen.add(parent.from);child=parent.from;}
 return trail;
}

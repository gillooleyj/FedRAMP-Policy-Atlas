import type {Edge,Entity} from '../data/types';
import {flowCard} from './flow';
export interface FlowBand {sourceId:string;label:string;x:number;y:number;width:number}
export interface FlowLane {sourceId:string;x:number;y:number;width:number;height:number}
const gap=40,rowGap=48,padding=28;
const level=(n:Entity)=>n.kind==='source'?0:['class','ruleset','theme','family'].includes(n.kind)?1:['subset','ksi','control'].includes(n.kind)?2:n.kind==='definition'?4:3;
const order:Record<string,number>={class:0,ruleset:1,theme:2,family:3,subset:4,ksi:5,control:6,rule:7,enhancement:8,definition:9,source:-1};
function bandLabel(source:string,rank:number){return source==='nist'?({1:'Control families',2:'Controls',3:'Control enhancements',4:'References'}[rank]??'Source'):({1:'Rulesets · KSI themes',2:'Rule subsets · KSIs',3:'Individual rules',4:'Definitions referenced in this view'}[rank]??'Source');}
/** Compact source-origin lanes, recomputed from the visible records only.
 * Position expresses document organization, never an invented verified relationship.
 * Both source documents share rank zero; definitions and applicability do not rerank them.
 */
export function flowArrangement(nodes:Entity[]){
 const positions=new Map<string,{x:number;y:number}>(),lanes:FlowLane[]=[],bands:FlowBand[]=[];
 const sources=[...new Set(nodes.map(n=>n.sourceId))].sort((a,b)=>a==='fedramp'?-1:b==='fedramp'?1:a.localeCompare(b));
 let x=0;
 for(const source of sources){
  const members=nodes.filter(n=>n.sourceId===source),columns=members.filter(n=>n.kind==='class').length>3?4:Math.min(3,Math.max(1,...[1,2,3,4].map(rank=>members.filter(n=>level(n)===rank).length)));
  const laneWidth=columns*flowCard.width+(columns-1)*gap+padding*2;
  const root=members.find(n=>n.kind==='source');
  if(root)positions.set(root.id,{x:x+(laneWidth-flowCard.width)/2,y:48});
  let y=root?48+flowCard.height+rowGap:48;
  const sections=[{label:'Certification classes · defined in CR26',items:members.filter(n=>n.kind==='class')},...[1,2,3,4].map(rank=>({label:bandLabel(source,rank),items:members.filter(n=>level(n)===rank&&n.kind!=='class')}))];
  for(const section of sections){
   const items=section.items.sort((a,b)=>order[a.kind]-order[b.kind]||a.id.localeCompare(b.id));
   if(!items.length)continue;
   bands.push({sourceId:source,label:section.label,x:x+padding,y:y-24,width:laneWidth-padding*2});
   const sectionColumns=items[0].kind==='class'?Math.min(4,items.length):Math.min(3,items.length),offset=(laneWidth-sectionColumns*flowCard.width-(sectionColumns-1)*gap)/2;
   items.forEach((n,i)=>positions.set(n.id,{x:x+offset+(i%sectionColumns)*(flowCard.width+gap),y:y+Math.floor(i/sectionColumns)*(flowCard.height+rowGap)}));
   y+=Math.ceil(items.length/sectionColumns)*(flowCard.height+rowGap)+24;
  }
  lanes.push({sourceId:source,x,y:12,width:laneWidth,height:Math.max(180,y-12)});x+=laneWidth+64;
 }
 return {positions,lanes,bands};
}
export function flowLayout(nodes:Entity[],edges:Edge[]=[]){void edges;return flowArrangement(nodes).positions;}

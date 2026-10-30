import type {Edge,Entity} from '../data/types';
import {flowCard} from './flow';
export interface FlowBand {sourceId:string;kind:Entity['kind'];label:string;x:number;y:number;width:number;height:number}
export interface FlowLane {sourceId:string;x:number;y:number;width:number;height:number}
const gap=40,rowGap=48,padding=28,headingSpace=52,sectionGap=40;
const sections:{kind:Entity['kind'];label:string}[]=[
 {kind:'class',label:'Certification classes · defined in CR26'},
 {kind:'ruleset',label:'Rules · Rulesets'},
 {kind:'subset',label:'Rules · Rule subsets'},
 {kind:'rule',label:'Rules · Individual rules'},
 {kind:'theme',label:'KSIs · Security themes'},
 {kind:'ksi',label:'KSIs · Key Security Indicators'},
 {kind:'family',label:'NIST · Control families'},
 {kind:'control',label:'NIST · Controls'},
 {kind:'enhancement',label:'NIST · Control enhancements'},
 {kind:'definition',label:'Definitions referenced in this view'},
];
/** Source groups and type sections are presentation, never invented relationships.
 * Heading rows have their own space above connector entry/exit tracks.
 */
export function flowArrangement(nodes:Entity[]){
 const positions=new Map<string,{x:number;y:number}>(),lanes:FlowLane[]=[],bands:FlowBand[]=[];
 const sources=[...new Set(nodes.map(n=>n.sourceId))].sort((a,b)=>a==='fedramp'?-1:b==='fedramp'?1:a.localeCompare(b));
 let x=0;
 for(const source of sources){
  const members=nodes.filter(n=>n.sourceId===source),columns=members.filter(n=>n.kind==='class').length>3?4:Math.min(3,Math.max(1,...sections.map(section=>members.filter(n=>n.kind===section.kind).length)));
  const laneWidth=columns*flowCard.width+(columns-1)*gap+padding*2;
  const root=members.find(n=>n.kind==='source');
  if(root)positions.set(root.id,{x:x+(laneWidth-flowCard.width)/2,y:48});
  let y=root?48+flowCard.height+sectionGap:48;
  for(const section of sections){
   const items=members.filter(n=>n.kind===section.kind).sort((a,b)=>a.id.localeCompare(b.id));
   if(!items.length)continue;
   bands.push({sourceId:source,kind:section.kind,label:section.label,x:x+padding,y,width:laneWidth-padding*2,height:24});
   y+=headingSpace;
   const sectionColumns=Math.min(section.kind==='class'?4:3,items.length),offset=(laneWidth-sectionColumns*flowCard.width-(sectionColumns-1)*gap)/2;
   items.forEach((n,i)=>positions.set(n.id,{x:x+offset+(i%sectionColumns)*(flowCard.width+gap),y:y+Math.floor(i/sectionColumns)*(flowCard.height+rowGap)}));
   y+=(Math.ceil(items.length/sectionColumns)-1)*(flowCard.height+rowGap)+flowCard.height+sectionGap;
  }
  lanes.push({sourceId:source,x,y:12,width:laneWidth,height:Math.max(180,y-12)});x+=laneWidth+64;
 }
 return {positions,lanes,bands};
}
export function flowLayout(nodes:Entity[],edges:Edge[]=[]){void edges;return flowArrangement(nodes).positions;}

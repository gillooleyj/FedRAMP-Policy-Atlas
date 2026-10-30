import type {Entity,Edge,Kind,OscalPart} from '../data/types';
export const palette:Record<Kind,string>={source:'#d7dfed',ruleset:'#59a9ff',subset:'#59a9ff',rule:'#59a9ff',definition:'#66c5cc',class:'#b99aef',theme:'#ee89c8',ksi:'#ee89c8',family:'#f3bb62',control:'#f3bb62',enhancement:'#f3bb62'};
export function entityColor(n:Pick<Entity,'kind'|'sourceId'>){return n.kind==='source'?(n.sourceId==='nist'?palette.family:palette.rule):palette[n.kind];}
export const categories=[{id:'rules',label:'FedRAMP rules',color:'#59a9ff',kinds:['ruleset','subset','rule']},{id:'ksi',label:'Key Security Indicators',color:'#ee89c8',kinds:['theme','ksi']},{id:'nist',label:'NIST controls',color:'#f3bb62',kinds:['family','control','enhancement']},{id:'definitions',label:'Definitions',color:'#66c5cc',kinds:['definition']},{id:'classes',label:'Certification classes',color:'#b99aef',kinds:['class']},{id:'sources',label:'Source documents',color:'#d7dfed',kinds:['source']}];
export function matchesClass(n:Entity,cls:string) {return !cls||n.classes?.includes(cls)||n.applicability?.classes?.includes(cls)||n.id==='class:'+cls;}
export function searchNodes(nodes:Entity[],query:string) {const q=query.trim().toLowerCase();if(!q)return nodes;const rank=(n:Entity)=>[n.id,n.title,n.sourceIdentifier].some(x=>x?.toLowerCase()===q)?0:[n.id,n.title,n.sourceIdentifier].some(x=>x?.toLowerCase().startsWith(q))?1:2;return nodes.filter(n=>[n.id,n.title,n.group,n.sourceIdentifier,n.raw.statement,n.raw.definition].some(x=>x?.toLowerCase().includes(q))).sort((a,b)=>rank(a)-rank(b));}
export function visibleEdges(edges:Edge[],nodes:Entity[],type:string,cls='') {const ids=new Set(nodes.map(n=>n.id));return edges.filter(e=>ids.has(e.from)&&ids.has(e.to)&&(!type||e.type===type)&&(!cls||!e.applicability?.classes||e.applicability.classes.includes(cls)));}
export function neighbors(id:string,edges:Edge[]) {return new Set(edges.filter(e=>e.from===id||e.to===id).flatMap(e=>[e.from,e.to]));}
function random(key:string) {let h=2166136261;for(const c of key)h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;}
export type Position=[number,number,number];
export function layout(nodes:Entity[]):Map<string,Position> {
 const groups=[...new Set(nodes.filter(n=>['control','enhancement','family'].includes(n.kind)).map(n=>n.group))].sort();
 return new Map(nodes.map(n=>{
  let center:Position=[0,0,0],spread=30;
  if(['family','control','enhancement'].includes(n.kind)){const a=groups.indexOf(n.group)/groups.length*Math.PI*2;center=[Math.cos(a)*150+70,Math.sin(a)*108,Math.sin(a*2)*35-35];spread=24;}
  else if(['rule','ruleset','subset'].includes(n.kind)){const a=random(n.group??'')*Math.PI*2;center=[-145+Math.cos(a)*65,Math.sin(a)*90,-5];spread=20;}
  else if(['ksi','theme'].includes(n.kind)){const a=random(n.group??'')*Math.PI*2;center=[15+Math.cos(a)*65,-110+Math.sin(a)*35,50];spread=13;}
  else if(n.kind==='definition'){center=[-50,135,5];spread=35;}
  else if(n.kind==='class'){center=[-175,-90,45];spread=20;}
  else center=n.id==='nist'?[90,0,0]:[-110,0,0];
  const r=spread*Math.cbrt(random(n.id+'r')),a=random(n.id+'a')*Math.PI*2,z=random(n.id+'z')*2-1,s=Math.sqrt(1-z*z);
  return [n.id,[center[0]+r*s*Math.cos(a),center[1]+r*s*Math.sin(a),center[2]+r*z] as Position];
 }));
}

export function oscalStatement(parts:OscalPart[]=[]):string {
 const walk=(p:OscalPart):string=>[p.prose?`${p.props?.find(x=>x.name==="label")?.value??""} ${p.prose}`.trim():"",...(p.parts??[]).map(walk)].filter(Boolean).join("\n\n");
 return parts.filter(p=>p.name==="statement").map(walk).join("\n\n");
}

import type {Edge,Entity} from '../data/types';
export const flowCard={width:224,height:112};
/** A small, explicitly labelled overview of existing branches; never synthetic links. */
export function flowOverview(nodes:Entity[],edges:Edge[]){
 const available=new Set(nodes.map(n=>n.id));
 const ids=new Set(['fedramp','nist','ruleset:FRC','theme:CNA','fr:KSI-CNA-EIS','nist:ac-4','nist:cm-6','nist:si-7'].filter(id=>available.has(id)));
 const containment=edges.filter(e=>e.type==='CONTAINS'&&e.provenanceStatus==='verified');
 // Include the exact structural ancestors of the featured controls and KSI.
 let changed=true;while(changed){changed=false;for(const e of containment)if(ids.has(e.to)&&available.has(e.from)&&!ids.has(e.from)){ids.add(e.from);changed=true;}}
 const subset=containment.find(e=>e.from==='ruleset:FRC'&&available.has(e.to));if(subset){ids.add(subset.to);const rule=containment.find(e=>e.from===subset.to&&available.has(e.to));if(rule)ids.add(rule.to);}
 if(!ids.size)for(const n of [...nodes].sort((a,b)=>a.id.localeCompare(b.id)).slice(0,12))ids.add(n.id);
 return nodes.filter(n=>ids.has(n.id));
}
export function flowSlice(nodes:Entity[],edges:Edge[],selected:string,distances:Map<string,number>,limit=60,activeEdge=''){
 const hierarchyOrder:Record<string,number>={source:0,class:1,ruleset:2,theme:2,family:2,subset:3,ksi:4,rule:4,control:4,enhancement:5,definition:6};
 const inspected=edges.find(e=>e.id===activeEdge);const priority=(n:Entity)=>n.id===selected?-1:inspected&&(n.id===inspected.from||n.id===inspected.to)?0:1;
 const candidates=selected?nodes.filter(n=>distances.has(n.id)).sort((a,b)=>priority(a)-priority(b)||(distances.get(a.id)!-distances.get(b.id)!)||hierarchyOrder[a.kind]-hierarchyOrder[b.kind]||a.id.localeCompare(b.id)):flowOverview(nodes,edges);
 const shown=candidates.slice(0,limit),ids=new Set(shown.map(n=>n.id));
 return {nodes:shown,edges:edges.filter(e=>e.provenanceStatus==='verified'&&ids.has(e.from)&&ids.has(e.to)),total:candidates.length};
}

export interface FlowBranch {id:string;label:string;count:number}
/** Display scopes traverse only published containment. They create no graph records. */
export function fedrampBranch(nodes:Entity[],structure:Edge[],branch='all',mappings=false){
 const available=new Map(nodes.map(n=>[n.id,n]));
 const fedramp=nodes.filter(n=>n.sourceId==='fedramp');
 const ids=new Set(branch==='all'?fedramp.map(n=>n.id):branch==='classes'||branch==='definitions'?fedramp.filter(n=>n.kind===(branch==='classes'?'class':'definition')).map(n=>n.id):available.has(branch)?[branch]:[]);
 const contains=structure.filter(e=>e.type==='CONTAINS'&&e.provenanceStatus==='verified');
 if(branch!=='all'&&branch!=='classes'&&branch!=='definitions'){
  let changed=true;while(changed){changed=false;for(const e of contains)if(ids.has(e.from)&&available.has(e.to)&&!ids.has(e.to)){ids.add(e.to);changed=true;}}
 }
 if(mappings)for(const e of structure)if(e.type==='PUBLISHED_CONTROL_MAPPING'&&e.provenanceStatus==='verified'&&ids.has(e.from)&&available.get(e.to)?.sourceId==='nist')ids.add(e.to);
 // Exact ancestors give each branch context, but never restore a filtered entity.
 let changed=true;while(changed){changed=false;for(const e of contains)if(ids.has(e.to)&&available.has(e.from)&&!ids.has(e.from)){ids.add(e.from);changed=true;}}
 const rank:Record<string,number>={source:0,ruleset:1,theme:1,class:1,subset:2,family:2,ksi:3,rule:3,control:4,enhancement:5,definition:6};
 return nodes.filter(n=>ids.has(n.id)).sort((a,b)=>(rank[a.kind]-rank[b.kind])||a.id.localeCompare(b.id));
}
export function flowBranches(nodes:Entity[],structure:Edge[]):FlowBranch[]{
 const roots=nodes.filter(n=>n.sourceId==='fedramp'&&(n.kind==='ruleset'||n.kind==='theme')).sort((a,b)=>a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id));
 return [{id:'nist',label:'NIST SP 800-53',count:nodes.filter(n=>n.sourceId==='nist').length},{id:'all',label:'Full FedRAMP',count:nodes.filter(n=>n.sourceId==='fedramp').length},...roots.map(n=>({id:n.id,label:`${n.kind==='theme'?'KSI theme':'Ruleset'} · ${n.sourceIdentifier??n.id} · ${n.title}`,count:fedrampBranch(nodes,structure,n.id).filter(n=>n.kind!=='source').length})),...(['classes','definitions'] as const).map(id=>({id,label:id==='classes'?'Certification classes':'Definitions',count:nodes.filter(n=>n.sourceId==='fedramp'&&n.kind===(id==='classes'?'class':'definition')).length})),{id:'example',label:'Example cross-framework path',count:flowOverview(nodes,structure).length}];
}
export function collectionSlice(nodes:Entity[],edges:Edge[],limit=60){
 const shown=nodes.slice(0,limit),ids=new Set(shown.map(n=>n.id));
 return {nodes:shown,edges:edges.filter(e=>e.provenanceStatus==='verified'&&ids.has(e.from)&&ids.has(e.to)),total:nodes.length};
}

/** Mapping visibility constrains traversal, not just painted connectors. Source peers stay navigable. */
export function flowAvailable(nodes:Entity[],mappings:boolean){return mappings?nodes:nodes.filter(n=>n.sourceId!=='nist'||n.kind==='source');}
export function withFlowContext(slice:{nodes:Entity[];edges:Edge[];total:number},available:Entity[],structure:Edge[],visibleEdges:Edge[],selected=''){
 const ids=new Set(slice.nodes.map(n=>n.id)),byId=new Map(available.map(n=>[n.id,n]));
 if(ids.size){for(const n of available)if(n.kind==='source'||(selected==='fedramp'&&n.kind==='class'&&n.sourceId==='fedramp'))ids.add(n.id);
  let changed=true;while(changed){changed=false;for(const e of structure)if(e.type==='CONTAINS'&&e.provenanceStatus==='verified'&&ids.has(e.to)&&byId.has(e.from)&&!ids.has(e.from)){ids.add(e.from);changed=true;}}
 }
 const contextIds=new Set([...ids].filter(id=>!slice.nodes.some(n=>n.id===id)));
 return {nodes:available.filter(n=>ids.has(n.id)),edges:visibleEdges.filter(e=>e.provenanceStatus==='verified'&&ids.has(e.from)&&ids.has(e.to)),total:slice.total,shown:slice.nodes.length,contextIds};
}

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
 const inspected=edges.find(e=>e.id===activeEdge);const priority=(n:Entity)=>n.id===selected?-1:inspected&&(n.id===inspected.from||n.id===inspected.to)?0:1;
 const candidates=selected?nodes.filter(n=>distances.has(n.id)).sort((a,b)=>priority(a)-priority(b)||(distances.get(a.id)!-distances.get(b.id)!)||a.id.localeCompare(b.id)):flowOverview(nodes,edges);
 const shown=candidates.slice(0,limit),ids=new Set(shown.map(n=>n.id));
 return {nodes:shown,edges:edges.filter(e=>e.provenanceStatus==='verified'&&ids.has(e.from)&&ids.has(e.to)),total:candidates.length};
}

import type {Graph} from '../data/types';
/** Follow only actual class applicability and published KSI associations.
 * Reading from class to KSI traverses APPLIES_TO in reverse; its source direction
 * and provenance are preserved. No transitive class-to-control edge is created.
 */
export function classControlTrace(graph:Graph,classId:string,indicator=''){
 const byId=new Map(graph.nodes.map(n=>[n.id,n]));
 const scope=graph.edges.filter(e=>e.provenanceStatus==='verified'&&e.type==='APPLIES_TO'&&e.to===classId&&byId.get(e.from)?.kind==='ksi');
 const indicators=scope.map(e=>byId.get(e.from)!).sort((a,b)=>a.id.localeCompare(b.id));
 const scopeEdges=scope.filter(e=>!indicator||e.from===indicator),ids=new Set(scopeEdges.map(e=>e.from));
 const mappings=graph.edges.filter(e=>e.provenanceStatus==='verified'&&e.type==='PUBLISHED_CONTROL_MAPPING'&&ids.has(e.from)&&byId.get(e.to)?.sourceId==='nist'&&(!e.applicability?.classes||e.applicability.classes.includes(classId.slice(6))));
 const distances=new Map<string,number>();if(byId.get(classId)?.kind==='class')distances.set(classId,0);
 for(const e of scopeEdges)distances.set(e.from,1);for(const e of mappings)distances.set(e.to,2);
 return {nodes:graph.nodes.filter(n=>distances.has(n.id)),edges:[...scopeEdges,...mappings],indicators,scopeEdges,mappings,distances,controlCount:new Set(mappings.map(e=>e.to)).size};
}
